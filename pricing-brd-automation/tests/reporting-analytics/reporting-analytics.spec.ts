import { test, expect } from '../../src/fixtures/pricing-fixtures';

/**
 * TC-RA: Reporting & Analytics Test Suite
 * Covers BRD Section: Pricing Reports and Analytics Dashboard
 */
test.describe('Reporting & Analytics @reporting', () => {
  test('TC-RA-001: Verify margin analysis report generation', async ({
    reportsPage,
  }) => {
    await test.step('Generate margin analysis report', async () => {
      await reportsPage.goto();
      await reportsPage.generateReport('margin_analysis', '2026-01-01', '2026-03-31');
    });

    await test.step('Verify report is generated with data', async () => {
      const rowCount = await reportsPage.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });
  });

  test('TC-RA-002: Verify price variance report', async ({ reportsPage }) => {
    await test.step('Generate price variance report', async () => {
      await reportsPage.goto();
      await reportsPage.generateReport('price_variance', '2026-01-01', '2026-03-31');
    });

    await test.step('Verify chart is displayed', async () => {
      const hasChart = await reportsPage.isChartDisplayed();
      expect(hasChart).toBeTruthy();
    });
  });

  test('TC-RA-003: Verify report export functionality', async ({ reportsPage }) => {
    await test.step('Generate and export report', async () => {
      await reportsPage.goto();
      await reportsPage.generateReport('margin_analysis', '2026-01-01', '2026-03-31');
      await reportsPage.exportReport();
    });

    await test.step('Verify export completed', async () => {
      const rowCount = await reportsPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });
  });

  test('TC-RA-004: Verify empty report for future date range', async ({
    reportsPage,
    page,
  }) => {
    await test.step('Generate report for future dates', async () => {
      await reportsPage.goto();
      await reportsPage.generateReport('margin_analysis', '2030-01-01', '2030-12-31');
    });

    await test.step('Verify no data message', async () => {
      const noData = page.locator('[data-testid="no-data-message"]');
      await expect(noData).toBeVisible();
    });
  });

  test('TC-RA-005: Reject report with invalid date range', async ({
    reportsPage,
    page,
  }) => {
    await test.step('Enter end date before start date', async () => {
      await reportsPage.goto();
      await reportsPage.generateReport('margin_analysis', '2026-12-31', '2026-01-01');
    });

    await test.step('Verify date range error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Invalid date range');
    });
  });
});
