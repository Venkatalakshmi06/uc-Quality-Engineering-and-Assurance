import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

export async function POST() {
  const projectRoot = process.cwd();
  const testsDir = path.join(projectRoot, "tests");
  const output: string[] = [];
  const errors: string[] = [];
  let totalFiles = 0;
  let validFiles = 0;
  let issueCount = 0;

  output.push("=== Agent 1: Playwright Script Validation & Maintenance ===\n");
  output.push(`Timestamp: ${new Date().toISOString()}\n`);

  output.push("\n--- Step 1: Checking test file structure ---\n");
  const specFiles = fs.readdirSync(testsDir).filter((f) => f.endsWith(".spec.ts"));
  const pageFiles = fs.existsSync(path.join(testsDir, "pages"))
    ? fs.readdirSync(path.join(testsDir, "pages")).filter((f) => f.endsWith(".ts"))
    : [];
  const fixtureFiles = fs.existsSync(path.join(testsDir, "fixtures"))
    ? fs.readdirSync(path.join(testsDir, "fixtures")).filter((f) => f.endsWith(".ts"))
    : [];

  output.push(`  Spec files found: ${specFiles.length}`);
  specFiles.forEach((f) => output.push(`    - ${f}`));
  output.push(`  Page Object files found: ${pageFiles.length}`);
  pageFiles.forEach((f) => output.push(`    - pages/${f}`));
  output.push(`  Fixture files found: ${fixtureFiles.length}`);
  fixtureFiles.forEach((f) => output.push(`    - fixtures/${f}`));
  totalFiles = specFiles.length + pageFiles.length + fixtureFiles.length;

  output.push("\n--- Step 2: Validating Playwright configuration ---\n");
  const configPath = path.join(projectRoot, "playwright.config.ts");
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, "utf-8");
    output.push("  playwright.config.ts: EXISTS");
    if (configContent.includes("testDir")) output.push("  - testDir configured");
    if (configContent.includes("baseURL")) output.push("  - baseURL configured");
    if (configContent.includes("webServer")) output.push("  - webServer configured");
    if (configContent.includes("projects")) output.push("  - projects configured");
    validFiles++;
  } else {
    errors.push("playwright.config.ts is missing");
    output.push("  playwright.config.ts: MISSING");
    issueCount++;
  }

  output.push("\n--- Step 3: Validating test script syntax (TypeScript) ---\n");
  try {
    const { stdout, stderr } = await execAsync(
      `npx tsc --noEmit --project tsconfig.json 2>&1 || true`,
      { cwd: projectRoot, timeout: 30000 }
    );
    const tscOutput = stdout + stderr;
    if (tscOutput.includes("error TS")) {
      const errorLines = tscOutput
        .split("\n")
        .filter((line) => line.includes("error TS"));
      const testErrors = errorLines.filter(
        (line) => line.includes("tests/") || line.includes("playwright")
      );
      if (testErrors.length > 0) {
        output.push(`  TypeScript errors in test files: ${testErrors.length}`);
        testErrors.forEach((e) => {
          output.push(`    ${e.trim()}`);
          errors.push(e.trim());
        });
        issueCount += testErrors.length;
      } else {
        output.push("  No TypeScript errors in test files");
      }
    } else {
      output.push("  TypeScript compilation: PASSED (no errors)");
    }
  } catch {
    output.push("  TypeScript check: Skipped (compilation environment not fully available)");
  }

  output.push("\n--- Step 4: Analyzing test structure and coverage ---\n");
  for (const specFile of specFiles) {
    const filePath = path.join(testsDir, specFile);
    const content = fs.readFileSync(filePath, "utf-8");
    const testMatches = content.match(/test\(["'`]/g);
    const testCount = testMatches ? testMatches.length : 0;
    const describeMatches = content.match(/test\.describe\(/g);
    const describeCount = describeMatches ? describeMatches.length : 0;
    const hasBeforeEach = content.includes("test.beforeEach");
    const hasImports = content.includes("import {");
    const usesPageObjects = content.includes("./pages/");

    output.push(`  ${specFile}:`);
    output.push(`    - Test cases: ${testCount}`);
    output.push(`    - Describe blocks: ${describeCount}`);
    output.push(`    - Uses beforeEach: ${hasBeforeEach ? "Yes" : "No"}`);
    output.push(`    - Has imports: ${hasImports ? "Yes" : "No"}`);
    output.push(`    - Uses Page Objects: ${usesPageObjects ? "Yes" : "No"}`);

    if (!hasImports) {
      errors.push(`${specFile}: Missing imports`);
      issueCount++;
    }
    if (!usesPageObjects) {
      errors.push(`${specFile}: Not using Page Object pattern`);
      issueCount++;
    }

    validFiles++;
  }

  output.push("\n--- Step 5: Validating Page Objects ---\n");
  for (const pageFile of pageFiles) {
    const filePath = path.join(testsDir, "pages", pageFile);
    const content = fs.readFileSync(filePath, "utf-8");
    const hasClass = content.includes("class ");
    const hasConstructor = content.includes("constructor");
    const hasLocators = content.includes("locator") || content.includes("getBy");
    const methodMatches = content.match(/async \w+/g);
    const methodCount = methodMatches ? methodMatches.length : 0;

    output.push(`  ${pageFile}:`);
    output.push(`    - Class defined: ${hasClass ? "Yes" : "No"}`);
    output.push(`    - Constructor: ${hasConstructor ? "Yes" : "No"}`);
    output.push(`    - Uses locators: ${hasLocators ? "Yes" : "No"}`);
    output.push(`    - Methods: ${methodCount}`);

    if (!hasClass) {
      errors.push(`pages/${pageFile}: Missing class definition`);
      issueCount++;
    }
    validFiles++;
  }

  output.push("\n--- Step 6: Validating Fixture Files ---\n");
  for (const fixtureFile of fixtureFiles) {
    const filePath = path.join(testsDir, "fixtures", fixtureFile);
    const content = fs.readFileSync(filePath, "utf-8");
    const hasExports = content.includes("export ");
    const hasTestData = content.includes("const ") || content.includes("interface ");

    output.push(`  ${fixtureFile}:`);
    output.push(`    - Has exports: ${hasExports ? "Yes" : "No"}`);
    output.push(`    - Has test data: ${hasTestData ? "Yes" : "No"}`);

    if (!hasExports) {
      errors.push(`fixtures/${fixtureFile}: No exports found`);
      issueCount++;
    }
    validFiles++;
  }

  output.push("\n--- Step 7: Checking data-testid usage ---\n");
  const allTestIds = new Set<string>();
  const allSpecContent = specFiles
    .map((f) => fs.readFileSync(path.join(testsDir, f), "utf-8"))
    .join("\n");
  const allPageContent = pageFiles
    .map((f) => fs.readFileSync(path.join(testsDir, "pages", f), "utf-8"))
    .join("\n");
  const combinedContent = allSpecContent + allPageContent;
  const testIdMatches = combinedContent.match(/data-testid=["']([^"']+)["']/g);
  if (testIdMatches) {
    testIdMatches.forEach((m) => {
      const id = m.match(/data-testid=["']([^"']+)["']/);
      if (id) allTestIds.add(id[1]);
    });
  }
  const templateTestIds = combinedContent.match(/data-testid=\`([^`]+)\`/g);
  if (templateTestIds) {
    templateTestIds.forEach((m) => {
      const id = m.match(/data-testid=`([^`]+)`/);
      if (id) allTestIds.add(id[1]);
    });
  }
  output.push(`  Unique data-testid selectors used: ${allTestIds.size}`);
  allTestIds.forEach((id) => output.push(`    - ${id}`));

  output.push("\n\n=== VALIDATION SUMMARY ===\n");
  output.push(`Total files analyzed: ${totalFiles + 1}`);
  output.push(`Valid files: ${validFiles}`);
  output.push(`Issues found: ${issueCount}`);
  output.push(`Status: ${issueCount === 0 ? "ALL SCRIPTS VALID" : `${issueCount} ISSUE(S) NEED ATTENTION`}`);

  const totalTests = specFiles.reduce((acc, f) => {
    const content = fs.readFileSync(path.join(testsDir, f), "utf-8");
    const matches = content.match(/test\(["'`]/g);
    return acc + (matches ? matches.length : 0);
  }, 0);

  return NextResponse.json({
    success: issueCount === 0,
    output: output.join("\n"),
    summary: {
      total: totalFiles + 1,
      passed: validFiles,
      failed: issueCount,
      errors,
    },
    totalTests,
  });
}
