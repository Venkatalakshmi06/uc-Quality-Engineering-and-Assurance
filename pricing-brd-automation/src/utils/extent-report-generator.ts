import * as fs from 'fs';
import * as path from 'path';

/**
 * Extent Report Generator
 * Transforms Playwright JSON results into a styled HTML Extent Report.
 */

interface TestResult {
  title: string;
  status: string;
  duration: number;
  errors?: Array<{ message: string }>;
}

interface TestSuite {
  title: string;
  specs: TestResult[];
  suites?: TestSuite[];
}

interface PlaywrightReport {
  suites: TestSuite[];
  stats: {
    startTime: string;
    duration: number;
    expected: number;
    unexpected: number;
    skipped: number;
    flaky: number;
  };
}

function getStatusBadge(status: string): string {
  const colors: Record<string, string> = {
    passed: '#28a745',
    expected: '#28a745',
    failed: '#dc3545',
    unexpected: '#dc3545',
    skipped: '#ffc107',
    flaky: '#fd7e14',
    timedOut: '#6f42c1',
  };
  const color = colors[status] || '#6c757d';
  return `<span style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;">${status.toUpperCase()}</span>`;
}

function flattenSuites(suites: TestSuite[], parentTitle = ''): Array<{ suite: string; test: TestResult }> {
  const results: Array<{ suite: string; test: TestResult }> = [];
  for (const suite of suites) {
    const fullTitle = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
    for (const spec of suite.specs) {
      results.push({ suite: fullTitle, test: spec });
    }
    if (suite.suites) {
      results.push(...flattenSuites(suite.suites, fullTitle));
    }
  }
  return results;
}

function generateExtentHtml(report: PlaywrightReport): string {
  const allTests = flattenSuites(report.suites);
  const passed = allTests.filter((t) => t.test.status === 'passed' || t.test.status === 'expected').length;
  const failed = allTests.filter((t) => t.test.status === 'failed' || t.test.status === 'unexpected').length;
  const skipped = allTests.filter((t) => t.test.status === 'skipped').length;
  const total = allTests.length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

  const testRows = allTests
    .map(
      (t, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${t.suite}</td>
      <td>${t.test.title}</td>
      <td>${getStatusBadge(t.test.status)}</td>
      <td>${(t.test.duration / 1000).toFixed(2)}s</td>
      <td>${t.test.errors?.map((e) => `<pre style="color:red;font-size:11px;max-height:100px;overflow:auto;">${escapeHtml(e.message)}</pre>`).join('') || '-'}</td>
    </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing BRD - Extent Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f6fa; color: #2d3436; }
    .header { background: linear-gradient(135deg, #2F5496, #1a365d); color: #fff; padding: 30px 40px; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { opacity: 0.8; font-size: 14px; }
    .stats { display: flex; gap: 20px; padding: 20px 40px; flex-wrap: wrap; }
    .stat-card { background: #fff; border-radius: 8px; padding: 20px 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); flex: 1; min-width: 150px; text-align: center; }
    .stat-card .value { font-size: 32px; font-weight: bold; }
    .stat-card .label { font-size: 13px; color: #636e72; margin-top: 5px; }
    .stat-card.pass .value { color: #28a745; }
    .stat-card.fail .value { color: #dc3545; }
    .stat-card.skip .value { color: #ffc107; }
    .stat-card.total .value { color: #2F5496; }
    .stat-card.rate .value { color: #00b894; }
    .chart-section { padding: 20px 40px; }
    .progress-bar { height: 24px; border-radius: 12px; overflow: hidden; display: flex; background: #e0e0e0; }
    .progress-bar .pass-bar { background: #28a745; }
    .progress-bar .fail-bar { background: #dc3545; }
    .progress-bar .skip-bar { background: #ffc107; }
    .table-section { padding: 20px 40px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
    th { background: #2F5496; color: #fff; padding: 12px 15px; text-align: left; font-size: 13px; }
    td { padding: 10px 15px; border-bottom: 1px solid #eee; font-size: 13px; }
    tr:hover { background: #f8f9fa; }
    .footer { text-align: center; padding: 20px; color: #636e72; font-size: 12px; }
    pre { white-space: pre-wrap; word-break: break-all; }
    .filter-bar { padding: 10px 40px; display: flex; gap: 10px; }
    .filter-btn { padding: 6px 16px; border: 1px solid #ddd; border-radius: 20px; background: #fff; cursor: pointer; font-size: 12px; }
    .filter-btn:hover, .filter-btn.active { background: #2F5496; color: #fff; border-color: #2F5496; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Pricing BRD - Extent Test Report</h1>
    <p>Multi-Product Range Pricing in Supply Chain Management | Generated: ${new Date().toISOString()}</p>
    <p>Duration: ${(report.stats.duration / 1000).toFixed(2)}s | Start: ${report.stats.startTime}</p>
  </div>

  <div class="stats">
    <div class="stat-card total"><div class="value">${total}</div><div class="label">Total Tests</div></div>
    <div class="stat-card pass"><div class="value">${passed}</div><div class="label">Passed</div></div>
    <div class="stat-card fail"><div class="value">${failed}</div><div class="label">Failed</div></div>
    <div class="stat-card skip"><div class="value">${skipped}</div><div class="label">Skipped</div></div>
    <div class="stat-card rate"><div class="value">${passRate}%</div><div class="label">Pass Rate</div></div>
  </div>

  <div class="chart-section">
    <div class="progress-bar">
      <div class="pass-bar" style="width:${passRate}%"></div>
      <div class="fail-bar" style="width:${total > 0 ? ((failed / total) * 100).toFixed(1) : 0}%"></div>
      <div class="skip-bar" style="width:${total > 0 ? ((skipped / total) * 100).toFixed(1) : 0}%"></div>
    </div>
  </div>

  <div class="filter-bar">
    <button class="filter-btn active" onclick="filterTests('all')">All</button>
    <button class="filter-btn" onclick="filterTests('passed')">Passed</button>
    <button class="filter-btn" onclick="filterTests('failed')">Failed</button>
    <button class="filter-btn" onclick="filterTests('skipped')">Skipped</button>
  </div>

  <div class="table-section">
    <table id="test-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Suite</th>
          <th>Test Case</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Error Details</th>
        </tr>
      </thead>
      <tbody>${testRows}</tbody>
    </table>
  </div>

  <div class="footer">
    <p>Pricing BRD Automation Framework | Powered by Playwright + Extent Report</p>
  </div>

  <script>
    function filterTests(status) {
      const rows = document.querySelectorAll('#test-table tbody tr');
      rows.forEach(row => {
        const badge = row.querySelector('td:nth-child(4) span');
        if (!badge) return;
        const testStatus = badge.textContent.toLowerCase();
        if (status === 'all') { row.style.display = ''; }
        else if (status === 'passed' && (testStatus === 'passed' || testStatus === 'expected')) { row.style.display = ''; }
        else if (status === 'failed' && (testStatus === 'failed' || testStatus === 'unexpected')) { row.style.display = ''; }
        else if (status === 'skipped' && testStatus === 'skipped') { row.style.display = ''; }
        else { row.style.display = 'none'; }
      });
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
    }
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Main execution
const jsonPath = path.resolve(__dirname, '../../reports/extent/test-results.json');
const outputPath = path.resolve(__dirname, '../../reports/extent/extent-report.html');

if (fs.existsSync(jsonPath)) {
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const report: PlaywrightReport = JSON.parse(rawData);
  const html = generateExtentHtml(report);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Extent report generated at: ${outputPath}`);
} else {
  // eslint-disable-next-line no-console
  console.error(`JSON results not found at ${jsonPath}. Run tests first.`);
  process.exit(1);
}
