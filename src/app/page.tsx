"use client";

import { useState } from "react";
import Link from "next/link";
import { CategorySummary, AuditCategory } from "@/lib/types";
import { getCategorySummary } from "@/lib/store";
import {
  hallucinationTests,
  instructionFollowingTests,
  edgeCaseTests,
  unsafeResponseTests,
} from "@/data/test-cases";

const categories: { key: AuditCategory; tests: number; href: string }[] = [
  {
    key: "hallucinations",
    tests: hallucinationTests.length,
    href: "/audit/hallucinations",
  },
  {
    key: "instruction-following",
    tests: instructionFollowingTests.length,
    href: "/audit/instruction-following",
  },
  {
    key: "edge-cases",
    tests: edgeCaseTests.length,
    href: "/audit/edge-cases",
  },
  {
    key: "unsafe-responses",
    tests: unsafeResponseTests.length,
    href: "/audit/unsafe-responses",
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string }> = {
  red: {
    border: "border-red-700",
    bg: "bg-red-900/20",
    text: "text-red-400",
  },
  amber: {
    border: "border-amber-700",
    bg: "bg-amber-900/20",
    text: "text-amber-400",
  },
  blue: {
    border: "border-blue-700",
    bg: "bg-blue-900/20",
    text: "text-blue-400",
  },
  purple: {
    border: "border-purple-700",
    bg: "bg-purple-900/20",
    text: "text-purple-400",
  },
};

export default function Dashboard() {
  const [summaries] = useState<CategorySummary[]>(() =>
    categories.map((c) => getCategorySummary(c.key, c.tests))
  );

  const totalTests = summaries.reduce((a, s) => a + s.total, 0);
  const totalPassed = summaries.reduce((a, s) => a + s.passed, 0);
  const totalFailed = summaries.reduce((a, s) => a + s.failed, 0);
  const totalWarnings = summaries.reduce((a, s) => a + s.warnings, 0);
  const totalCompleted = totalPassed + totalFailed + totalWarnings;
  const overallCompletion =
    totalTests > 0 ? Math.round((totalCompleted / totalTests) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          ChatGPT Audit Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          Systematically evaluate ChatGPT for hallucinations, instruction
          following failures, edge case breakdowns, and unsafe responses.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-white">{totalTests}</div>
          <div className="text-sm text-gray-500 mt-1">Total Test Cases</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{totalPassed}</div>
          <div className="text-sm text-gray-500 mt-1">Passed</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{totalFailed}</div>
          <div className="text-sm text-gray-500 mt-1">Failed</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">
            {totalWarnings}
          </div>
          <div className="text-sm text-gray-500 mt-1">Warnings</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">
            {overallCompletion}%
          </div>
          <div className="text-sm text-gray-500 mt-1">Completion</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {summaries.map((summary, i) => {
          const colors = colorMap[summary.color] || colorMap.blue;
          const completed =
            summary.passed + summary.failed + summary.warnings;
          const progress =
            summary.total > 0
              ? Math.round((completed / summary.total) * 100)
              : 0;

          return (
            <Link
              key={summary.category}
              href={categories[i].href}
              className={`block bg-gray-800 border ${colors.border} rounded-lg p-6 hover:bg-gray-750 transition-colors group`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl">{summary.icon}</span>
                  <h2
                    className={`text-xl font-semibold ${colors.text} mt-2 group-hover:underline`}
                  >
                    {summary.label}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {summary.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {summary.total}
                  </div>
                  <div className="text-xs text-gray-500">tests</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>
                    {completed} of {summary.total} evaluated
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`${colors.bg} h-2 rounded-full transition-all`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex gap-4 text-xs">
                <span className="text-green-400">
                  {summary.passed} passed
                </span>
                <span className="text-red-400">{summary.failed} failed</span>
                <span className="text-yellow-400">
                  {summary.warnings} warnings
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-3">
          How to Use This Tool
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
          <div className="space-y-2">
            <div className="text-white font-medium">1. Select a Category</div>
            <p>
              Click on any audit category above to view its test cases. Each
              category targets a specific weakness in ChatGPT.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-white font-medium">2. Run Test Cases</div>
            <p>
              Copy each test prompt into ChatGPT, then paste the response back
              into the tool for evaluation. Score each response.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-white font-medium">3. Review Report</div>
            <p>
              Visit the Report page for a comprehensive summary of all audit
              results including pass rates and common failure patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
