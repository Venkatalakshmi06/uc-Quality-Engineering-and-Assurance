"use client";

import { useState } from "react";
import { TestCase, TestResult, TestStatus } from "@/lib/types";
import { getResultForTest, saveResult } from "@/lib/store";

interface TestCaseCardProps {
  testCase: TestCase;
  onResultChange?: () => void;
}

const severityColors: Record<string, string> = {
  critical: "bg-red-900/50 text-red-300 border-red-700",
  high: "bg-orange-900/50 text-orange-300 border-orange-700",
  medium: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  low: "bg-green-900/50 text-green-300 border-green-700",
};

const statusColors: Record<string, string> = {
  pass: "bg-green-600",
  fail: "bg-red-600",
  warning: "bg-yellow-600",
  pending: "bg-gray-600",
};

const statusLabels: Record<string, string> = {
  pass: "PASS",
  fail: "FAIL",
  warning: "WARNING",
  pending: "PENDING",
};

export default function TestCaseCard({
  testCase,
  onResultChange,
}: TestCaseCardProps) {
  const existing = getResultForTest(testCase.id);
  const [expanded, setExpanded] = useState(false);
  const [response, setResponse] = useState(existing?.response ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [status, setStatus] = useState<TestStatus>(existing?.status ?? "pending");
  const [score, setScore] = useState(existing?.score ?? 0);
  const [saved, setSaved] = useState(!!existing);

  const handleSave = () => {
    const result: TestResult = {
      testId: testCase.id,
      status,
      response,
      notes,
      score,
      timestamp: new Date().toISOString(),
    };
    saveResult(result);
    setSaved(true);
    onResultChange?.();
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`px-2 py-0.5 rounded text-xs font-mono ${statusColors[status]} text-white`}
          >
            {statusLabels[status]}
          </span>
          <span className="text-white font-medium truncate">
            {testCase.title}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs border ${severityColors[testCase.severity]}`}
          >
            {testCase.severity}
          </span>
        </div>
        <span className="text-gray-400 ml-2 flex-shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-700 space-y-4">
          <div className="pt-3">
            <p className="text-gray-400 text-sm">{testCase.description}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Prompt to Test
            </h4>
            <div className="bg-gray-900 rounded p-3 text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-40 overflow-auto">
              {testCase.prompt}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Expected Behavior
            </h4>
            <div className="bg-gray-900 rounded p-3 text-sm text-green-400">
              {testCase.expectedBehavior}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              ChatGPT Response (paste here)
            </h4>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-gray-300 min-h-[120px] focus:outline-none focus:border-blue-500 resize-y"
              placeholder="Paste the ChatGPT response here for evaluation..."
              value={response}
              onChange={(e) => {
                setResponse(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Evaluation
              </h4>
              <div className="flex gap-2">
                {(["pass", "fail", "warning"] as TestStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatus(s);
                      setSaved(false);
                    }}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      status === s
                        ? `${statusColors[s]} text-white`
                        : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-32">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Score (0-10)
              </h4>
              <input
                type="number"
                min="0"
                max="10"
                value={score}
                onChange={(e) => {
                  setScore(Number(e.target.value));
                  setSaved(false);
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Notes
            </h4>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-gray-300 min-h-[60px] focus:outline-none focus:border-blue-500 resize-y"
              placeholder="Add evaluation notes..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
            >
              Save Evaluation
            </button>
            {saved && (
              <span className="text-green-400 text-sm">Saved</span>
            )}
            <div className="flex gap-1 ml-auto">
              {testCase.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
