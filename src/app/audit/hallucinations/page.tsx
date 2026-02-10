"use client";

import { useState, useCallback } from "react";
import { hallucinationTests } from "@/data/test-cases";
import TestCaseCard from "@/components/TestCaseCard";
import CategoryStats from "@/components/CategoryStats";
import { getCategorySummary } from "@/lib/store";

export default function HallucinationsPage() {
  const [summary, setSummary] = useState(() =>
    getCategorySummary("hallucinations", hallucinationTests.length)
  );

  const refresh = useCallback(() => {
    setSummary(
      getCategorySummary("hallucinations", hallucinationTests.length)
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-red-400">
          Hallucination Detection
        </h1>
        <p className="text-gray-400 mt-1">
          Test ChatGPT for fabricated facts, citations, statistics, URLs, and
          confidently wrong information.
        </p>
      </div>

      <CategoryStats summary={summary} />

      <div className="space-y-3">
        {hallucinationTests.map((tc) => (
          <TestCaseCard key={tc.id} testCase={tc} onResultChange={refresh} />
        ))}
      </div>
    </div>
  );
}
