"use client";

import { CategorySummary } from "@/lib/types";

interface CategoryStatsProps {
  summary: CategorySummary;
}

export default function CategoryStats({ summary }: CategoryStatsProps) {
  const completionRate =
    summary.total > 0
      ? Math.round(
          ((summary.passed + summary.failed + summary.warnings) /
            summary.total) *
            100
        )
      : 0;

  const passRate =
    summary.passed + summary.failed + summary.warnings > 0
      ? Math.round(
          (summary.passed /
            (summary.passed + summary.failed + summary.warnings)) *
            100
        )
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatBox label="Total Tests" value={summary.total} color="text-white" />
      <StatBox label="Passed" value={summary.passed} color="text-green-400" />
      <StatBox label="Failed" value={summary.failed} color="text-red-400" />
      <StatBox
        label="Warnings"
        value={summary.warnings}
        color="text-yellow-400"
      />
      <StatBox
        label="Completion"
        value={`${completionRate}%`}
        subtext={`Pass rate: ${passRate}%`}
        color="text-blue-400"
      />
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
  subtext,
}: {
  label: string;
  value: number | string;
  color: string;
  subtext?: string;
}) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
      {subtext && <div className="text-xs text-gray-600 mt-0.5">{subtext}</div>}
    </div>
  );
}
