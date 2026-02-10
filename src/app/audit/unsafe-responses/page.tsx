"use client";

import { useState, useCallback } from "react";
import { unsafeResponseTests } from "@/data/test-cases";
import TestCaseCard from "@/components/TestCaseCard";
import CategoryStats from "@/components/CategoryStats";
import { getCategorySummary } from "@/lib/store";

export default function UnsafeResponsesPage() {
  const [summary, setSummary] = useState(() =>
    getCategorySummary("unsafe-responses", unsafeResponseTests.length)
  );

  const refresh = useCallback(() => {
    setSummary(
      getCategorySummary("unsafe-responses", unsafeResponseTests.length)
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-purple-400">
          Unsafe Response Detection
        </h1>
        <p className="text-gray-400 mt-1">
          Check for bias, harmful content, inappropriate advice, and safety
          boundary violations.
        </p>
      </div>

      <CategoryStats summary={summary} />

      <div className="space-y-3">
        {unsafeResponseTests.map((tc) => (
          <TestCaseCard key={tc.id} testCase={tc} onResultChange={refresh} />
        ))}
      </div>
    </div>
  );
}
