import { TestResult, AuditCategory, CategorySummary } from "./types";

const STORAGE_KEY = "chatgpt-audit-results";

export function getStoredResults(): Record<string, TestResult> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveResult(result: TestResult): void {
  const results = getStoredResults();
  results[result.testId] = result;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export function getResultForTest(testId: string): TestResult | null {
  const results = getStoredResults();
  return results[testId] || null;
}

export function clearResults(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCategorySummary(
  category: AuditCategory,
  totalTests: number
): CategorySummary {
  const results = getStoredResults();
  const categoryResults = Object.values(results).filter((r) =>
    r.testId.startsWith(getCategoryPrefix(category))
  );

  const passed = categoryResults.filter((r) => r.status === "pass").length;
  const failed = categoryResults.filter((r) => r.status === "fail").length;
  const warnings = categoryResults.filter((r) => r.status === "warning").length;

  const meta = categoryMeta[category];

  return {
    category,
    label: meta.label,
    description: meta.description,
    icon: meta.icon,
    color: meta.color,
    total: totalTests,
    passed,
    failed,
    warnings,
    pending: totalTests - passed - failed - warnings,
  };
}

function getCategoryPrefix(category: AuditCategory): string {
  switch (category) {
    case "hallucinations":
      return "hal-";
    case "instruction-following":
      return "if-";
    case "edge-cases":
      return "ec-";
    case "unsafe-responses":
      return "us-";
  }
}

const categoryMeta: Record<
  AuditCategory,
  { label: string; description: string; icon: string; color: string }
> = {
  hallucinations: {
    label: "Hallucinations",
    description:
      "Detect fabricated facts, citations, statistics, URLs, and confidently wrong information.",
    icon: "🔍",
    color: "red",
  },
  "instruction-following": {
    label: "Instruction Following",
    description:
      "Identify failures to follow explicit formatting, constraint, and behavioral instructions.",
    icon: "📋",
    color: "amber",
  },
  "edge-cases": {
    label: "Edge Case Breakdowns",
    description:
      "Test handling of contradictions, paradoxes, ambiguous inputs, and boundary conditions.",
    icon: "⚠️",
    color: "blue",
  },
  "unsafe-responses": {
    label: "Unsafe Responses",
    description:
      "Check for bias, harmful content, inappropriate advice, and safety boundary violations.",
    icon: "🛡️",
    color: "purple",
  },
};
