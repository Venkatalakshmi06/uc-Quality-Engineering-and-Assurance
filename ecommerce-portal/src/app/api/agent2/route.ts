import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  const projectRoot = process.cwd();
  const output: string[] = [];

  output.push("=== Agent 2: E2E Test Execution Report ===\n");
  output.push(`Timestamp: ${new Date().toISOString()}\n`);
  output.push("--- Executing Playwright Tests ---\n");

  let testOutput = "";
  let passed = 0;
  let failed = 0;
  let total = 0;
  const errors: string[] = [];

  try {
    const { stdout, stderr } = await execAsync(
      `npx playwright test --reporter=list 2>&1`,
      {
        cwd: projectRoot,
        timeout: 120000,
        env: { ...process.env, CI: "false" },
      }
    );
    testOutput = stdout + stderr;
  } catch (execError: unknown) {
    const error = execError as { stdout?: string; stderr?: string };
    testOutput = (error.stdout || "") + (error.stderr || "");
  }

  const lines = testOutput.split("\n");
  const resultLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("[chromium]") || trimmed.match(/^\d+\s+\[chromium\]/)) {
      continue;
    }
    if (trimmed.match(/^[✓✘]/) || trimmed.match(/^\d+\s+[✓✘]/)) {
      resultLines.push(trimmed);
    }
  }

  for (const line of resultLines) {
    if (line.includes("✓")) passed++;
    if (line.includes("✘")) failed++;
  }

  const summaryMatch = testOutput.match(/(\d+) passed/);
  const failedMatch = testOutput.match(/(\d+) failed/);
  if (summaryMatch) passed = parseInt(summaryMatch[1]);
  if (failedMatch) failed = parseInt(failedMatch[1]);
  total = passed + failed;

  output.push("Test Results:\n");
  for (const line of resultLines) {
    output.push(`  ${line}`);
  }

  if (failed > 0) {
    output.push("\n--- Failed Test Details ---\n");
    let inFailure = false;
    for (const line of lines) {
      if (line.match(/^\s+\d+\)/) || line.includes("Error:")) {
        inFailure = true;
      }
      if (inFailure) {
        output.push(`  ${line}`);
        if (line.trim() === "" && inFailure) {
          const nextIdx = lines.indexOf(line) + 1;
          if (nextIdx < lines.length && !lines[nextIdx].startsWith(" ")) {
            inFailure = false;
          }
        }
      }
    }

    const failedTests = resultLines.filter((l) => l.includes("✘"));
    failedTests.forEach((t) => {
      const testName = t.replace(/.*✘\s*\d*\s*/, "").trim();
      errors.push(testName);
    });
  }

  const durationMatch = testOutput.match(/\(([^)]+)\)[\s]*$/m);
  const duration = durationMatch ? durationMatch[1] : "N/A";

  output.push("\n\n=== EXECUTION SUMMARY ===\n");
  output.push(`Total Tests: ${total}`);
  output.push(`Passed: ${passed}`);
  output.push(`Failed: ${failed}`);
  output.push(`Duration: ${duration}`);
  output.push(`Pass Rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`);
  output.push(`Status: ${failed === 0 ? "ALL TESTS PASSED" : `${failed} TEST(S) FAILED`}`);

  return NextResponse.json({
    success: failed === 0,
    output: output.join("\n"),
    summary: {
      total,
      passed,
      failed,
      errors,
    },
  });
}
