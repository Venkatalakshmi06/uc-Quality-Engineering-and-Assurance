"use client";

import { useState } from "react";
import Link from "next/link";
import { AuditCategory, TestResult } from "@/lib/types";
import { getStoredResults, clearResults, getCategorySummary } from "@/lib/store";
import {
  hallucinationTests,
  instructionFollowingTests,
  edgeCaseTests,
  unsafeResponseTests,
  allTestCases,
} from "@/data/test-cases";

interface CategoryReport {
  category: AuditCategory;
  label: string;
  color: string;
  href: string;
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  pending: number;
  avgScore: number;
  failedTests: { id: string; title: string; score: number }[];
}

const LINT_HISTORY_KEY = "chatgpt-audit-lint-history";

interface LintEntry {
  timestamp: string;
  errors: number;
  warnings: number;
  commonIssues: string[];
}

function getLintHistory(): LintEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LINT_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export default function ReportPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const categoryConfigs: {
    key: AuditCategory;
    label: string;
    color: string;
    href: string;
    tests: typeof hallucinationTests;
  }[] = [
    {
      key: "hallucinations",
      label: "Hallucinations",
      color: "text-red-400",
      href: "/audit/hallucinations",
      tests: hallucinationTests,
    },
    {
      key: "instruction-following",
      label: "Instruction Following",
      color: "text-amber-400",
      href: "/audit/instruction-following",
      tests: instructionFollowingTests,
    },
    {
      key: "edge-cases",
      label: "Edge Cases",
      color: "text-blue-400",
      href: "/audit/edge-cases",
      tests: edgeCaseTests,
    },
    {
      key: "unsafe-responses",
      label: "Unsafe Responses",
      color: "text-purple-400",
      href: "/audit/unsafe-responses",
      tests: unsafeResponseTests,
    },
  ];

  const [reports] = useState<CategoryReport[]>(() => {
    const results = getStoredResults();
    return categoryConfigs.map((config) => {
      const summary = getCategorySummary(config.key, config.tests.length);
      const categoryResults = config.tests
        .map((t) => ({ test: t, result: results[t.id] }))
        .filter(
          (r): r is { test: (typeof config.tests)[0]; result: TestResult } =>
            r.result !== undefined && r.result !== null
        );

      const avgScore =
        categoryResults.length > 0
          ? Math.round(
              (categoryResults.reduce((a, r) => a + r.result.score, 0) /
                categoryResults.length) *
                10
            ) / 10
          : 0;

      const failedTests = categoryResults
        .filter((r) => r.result.status === "fail")
        .map((r) => ({
          id: r.test.id,
          title: r.test.title,
          score: r.result.score,
        }));

      return {
        category: config.key,
        label: config.label,
        color: config.color,
        href: config.href,
        total: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        warnings: summary.warnings,
        pending: summary.pending,
        avgScore,
        failedTests,
      };
    });
  });
  const [lintHistory] = useState<LintEntry[]>(() => getLintHistory());

  const totalTests = reports.reduce((a, r) => a + r.total, 0);
  const totalPassed = reports.reduce((a, r) => a + r.passed, 0);
  const totalFailed = reports.reduce((a, r) => a + r.failed, 0);
  const totalWarnings = reports.reduce((a, r) => a + r.warnings, 0);
  const totalCompleted = totalPassed + totalFailed + totalWarnings;
  const overallPassRate =
    totalCompleted > 0 ? Math.round((totalPassed / totalCompleted) * 100) : 0;
  const overallAvgScore =
    reports.length > 0
      ? Math.round(
          (reports.reduce((a, r) => a + r.avgScore, 0) / reports.length) * 10
        ) / 10
      : 0;

  const allFailedTests = reports.flatMap((r) =>
    r.failedTests.map((f) => ({ ...f, category: r.label, color: r.color }))
  );

  const commonFailurePatterns = getCommonPatterns();

  function getCommonPatterns(): { pattern: string; count: number; severity: string }[] {
    const results = getStoredResults();
    const failedResults = Object.values(results).filter(
      (r) => r.status === "fail"
    );

    const patternCounts: Record<string, number> = {};
    failedResults.forEach((r) => {
      const test = allTestCases.find((t) => t.id === r.testId);
      if (test) {
        test.tags.forEach((tag) => {
          patternCounts[tag] = (patternCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pattern, count]) => ({
        pattern,
        count,
        severity: count >= 3 ? "critical" : count >= 2 ? "high" : "medium",
      }));
  }

  const handleClearResults = () => {
    clearResults();
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Report</h1>
          <p className="text-gray-400 mt-1">
            Comprehensive summary of all ChatGPT audit results.
          </p>
        </div>
        <div className="flex gap-2">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
            >
              Clear All Results
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleClearResults}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Confirm Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 text-center">
          <div className="text-4xl font-bold text-white">
            {totalCompleted}/{totalTests}
          </div>
          <div className="text-sm text-gray-500 mt-2">Tests Completed</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 text-center">
          <div
            className={`text-4xl font-bold ${
              overallPassRate >= 70
                ? "text-green-400"
                : overallPassRate >= 40
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {overallPassRate}%
          </div>
          <div className="text-sm text-gray-500 mt-2">Overall Pass Rate</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 text-center">
          <div className="text-4xl font-bold text-blue-400">
            {overallAvgScore}
          </div>
          <div className="text-sm text-gray-500 mt-2">Avg Score (0-10)</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 text-center">
          <div className="text-4xl font-bold text-red-400">
            {totalFailed}
          </div>
          <div className="text-sm text-gray-500 mt-2">Total Failures</div>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            Category Breakdown
          </h2>
        </div>
        <div className="divide-y divide-gray-700">
          {reports.map((report) => {
            const completedCount =
              report.passed + report.failed + report.warnings;
            const passRate =
              completedCount > 0
                ? Math.round((report.passed / completedCount) * 100)
                : 0;

            return (
              <Link
                key={report.category}
                href={report.href}
                className="block px-6 py-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-semibold ${report.color}`}>
                      {report.label}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      {completedCount}/{report.total} completed
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-green-400">
                      {report.passed} pass
                    </span>
                    <span className="text-red-400">{report.failed} fail</span>
                    <span className="text-yellow-400">
                      {report.warnings} warn
                    </span>
                    <span className="text-gray-400">
                      Avg: {report.avgScore}/10
                    </span>
                    <span
                      className={`font-bold ${
                        passRate >= 70
                          ? "text-green-400"
                          : passRate >= 40
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {passRate}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        report.total > 0
                          ? (report.passed / report.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {allFailedTests.length > 0 && (
        <div className="bg-gray-800 border border-red-900 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-red-400">
              Failed Test Cases
            </h2>
          </div>
          <div className="divide-y divide-gray-700">
            {allFailedTests.map((test) => (
              <div key={test.id} className="px-6 py-3 flex items-center gap-4">
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded font-mono">
                  FAIL
                </span>
                <span className="text-gray-300 flex-1">{test.title}</span>
                <span className={`text-sm ${test.color}`}>
                  {test.category}
                </span>
                <span className="text-gray-500 text-sm">
                  Score: {test.score}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {commonFailurePatterns.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              Common Failure Patterns
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Most frequent tags among failed test cases
            </p>
          </div>
          <div className="px-6 py-4 flex flex-wrap gap-2">
            {commonFailurePatterns.map((p) => (
              <span
                key={p.pattern}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  p.severity === "critical"
                    ? "bg-red-900/50 text-red-300 border border-red-700"
                    : p.severity === "high"
                    ? "bg-orange-900/50 text-orange-300 border border-orange-700"
                    : "bg-yellow-900/50 text-yellow-300 border border-yellow-700"
                }`}
              >
                {p.pattern} ({p.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {lintHistory.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              Lint Error History
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Historical record of code linting errors and common mistakes
            </p>
          </div>
          <div className="divide-y divide-gray-700">
            {lintHistory.map((entry, idx) => (
              <div key={idx} className="px-6 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-red-400">
                      {entry.errors} errors
                    </span>
                    <span className="text-yellow-400">
                      {entry.warnings} warnings
                    </span>
                  </div>
                </div>
                {entry.commonIssues.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.commonIssues.map((issue, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCompleted === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
          <div className="text-gray-500 text-lg">No audit results yet</div>
          <p className="text-gray-600 mt-2">
            Start by evaluating test cases in any audit category.
          </p>
          <Link
            href="/audit/hallucinations"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Start Auditing
          </Link>
        </div>
      )}
    </div>
  );
}
