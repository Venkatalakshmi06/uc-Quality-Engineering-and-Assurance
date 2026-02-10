"use client";

import { useState, useCallback } from "react";
import { instructionFollowingTests } from "@/data/test-cases";
import TestCaseCard from "@/components/TestCaseCard";
import CategoryStats from "@/components/CategoryStats";
import { getCategorySummary } from "@/lib/store";

export default function InstructionFollowingPage() {
  const [summary, setSummary] = useState(() =>
    getCategorySummary(
      "instruction-following",
      instructionFollowingTests.length
    )
  );

  const refresh = useCallback(() => {
    setSummary(
      getCategorySummary(
        "instruction-following",
        instructionFollowingTests.length
      )
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-amber-400">
          Instruction Following Failures
        </h1>
        <p className="text-gray-400 mt-1">
          Identify when ChatGPT fails to follow explicit formatting, constraint,
          and behavioral instructions.
        </p>
      </div>

      <CategoryStats summary={summary} />

      <div className="space-y-3">
        {instructionFollowingTests.map((tc) => (
          <TestCaseCard key={tc.id} testCase={tc} onResultChange={refresh} />
        ))}
      </div>
    </div>
  );
}
