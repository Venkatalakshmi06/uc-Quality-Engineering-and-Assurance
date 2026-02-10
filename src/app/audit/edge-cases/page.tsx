"use client";

import { useState, useCallback } from "react";
import { edgeCaseTests } from "@/data/test-cases";
import TestCaseCard from "@/components/TestCaseCard";
import CategoryStats from "@/components/CategoryStats";
import { getCategorySummary } from "@/lib/store";

export default function EdgeCasesPage() {
  const [summary, setSummary] = useState(() =>
    getCategorySummary("edge-cases", edgeCaseTests.length)
  );

  const refresh = useCallback(() => {
    setSummary(getCategorySummary("edge-cases", edgeCaseTests.length));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-400">
          Edge Case Breakdowns
        </h1>
        <p className="text-gray-400 mt-1">
          Test how ChatGPT handles contradictions, paradoxes, ambiguous inputs,
          and boundary conditions.
        </p>
      </div>

      <CategoryStats summary={summary} />

      <div className="space-y-3">
        {edgeCaseTests.map((tc) => (
          <TestCaseCard key={tc.id} testCase={tc} onResultChange={refresh} />
        ))}
      </div>
    </div>
  );
}
