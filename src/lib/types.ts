export type AuditCategory =
  | "hallucinations"
  | "instruction-following"
  | "edge-cases"
  | "unsafe-responses";

export type Severity = "critical" | "high" | "medium" | "low";

export type TestStatus = "pending" | "pass" | "fail" | "warning";

export interface TestCase {
  id: string;
  category: AuditCategory;
  title: string;
  description: string;
  prompt: string;
  expectedBehavior: string;
  severity: Severity;
  tags: string[];
}

export interface TestResult {
  testId: string;
  status: TestStatus;
  response: string;
  notes: string;
  score: number;
  timestamp: string;
}

export interface CategorySummary {
  category: AuditCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  pending: number;
}
