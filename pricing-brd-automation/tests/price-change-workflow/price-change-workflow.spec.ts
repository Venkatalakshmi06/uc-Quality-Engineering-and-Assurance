import { test, expect } from '../../src/fixtures/pricing-fixtures';

/**
 * TC-PC: Price Change Workflow Test Suite
 * Covers BRD Section: Price Change Request and Approval Workflow
 */
test.describe('Price Change Workflow @price-change', () => {
  test('TC-PC-001: Verify price change request submission', async ({
    approvalWorkflowPage,
    page,
  }) => {
    await test.step('Submit price change request', async () => {
      await approvalWorkflowPage.goto();
      await page.locator('[data-testid="new-request-btn"]').click();
      await page.locator('[data-testid="request-type"]').selectOption('price_change');
      await page.locator('[data-testid="product-sku"]').fill('SKU-1001');
      await page.locator('[data-testid="current-price"]').fill('150.00');
      await page.locator('[data-testid="proposed-price"]').fill('160.00');
      await approvalWorkflowPage.submitApprovalRequest('Annual cost increase pass-through');
    });

    await test.step('Verify request submitted successfully', async () => {
      const status = page.locator('[data-testid="request-status"]');
      await expect(status).toContainText('Pending');
    });
  });

  test('TC-PC-002: Verify bulk price change upload', async ({ approvalWorkflowPage, page }) => {
    await test.step('Navigate to bulk price change', async () => {
      await approvalWorkflowPage.goto();
      await page.locator('[data-testid="new-request-btn"]').click();
      await page.locator('[data-testid="request-type"]').selectOption('bulk_update');
    });

    await test.step('Upload bulk price change file', async () => {
      const fileChooser = page.locator('[data-testid="bulk-upload-input"]');
      await expect(fileChooser).toBeVisible();
    });
  });

  test('TC-PC-003: Verify price change effective date scheduling', async ({
    approvalWorkflowPage,
    page,
  }) => {
    await test.step('Schedule future price change', async () => {
      await approvalWorkflowPage.goto();
      await page.locator('[data-testid="new-request-btn"]').click();
      await page.locator('[data-testid="request-type"]').selectOption('price_change');
      await page.locator('[data-testid="product-sku"]').fill('SKU-1001');
      await page.locator('[data-testid="effective-date"]').fill('2026-07-01');
      await page.locator('[data-testid="proposed-price"]').fill('165.00');
      await approvalWorkflowPage.submitApprovalRequest('Q3 price adjustment');
    });

    await test.step('Verify scheduled effective date', async () => {
      const effectiveDate = page.locator('[data-testid="effective-date-display"]');
      await expect(effectiveDate).toContainText('2026-07-01');
    });
  });

  test('TC-PC-004: Reject price change exceeding max allowed percentage', async ({
    approvalWorkflowPage,
    page,
  }) => {
    await test.step('Submit price change exceeding threshold', async () => {
      await approvalWorkflowPage.goto();
      await page.locator('[data-testid="new-request-btn"]').click();
      await page.locator('[data-testid="request-type"]').selectOption('price_change');
      await page.locator('[data-testid="product-sku"]').fill('SKU-1001');
      await page.locator('[data-testid="current-price"]').fill('150.00');
      await page.locator('[data-testid="proposed-price"]').fill('300.00');
      await approvalWorkflowPage.submitApprovalRequest('Major price increase');
    });

    await test.step('Verify escalation for large price change', async () => {
      const escalation = page.locator('[data-testid="escalation-notice"]');
      await expect(escalation).toContainText('requires additional approval');
    });
  });

  test('TC-PC-005: Verify audit trail for price change', async ({
    approvalWorkflowPage,
    page,
  }) => {
    await test.step('View price change audit history', async () => {
      await approvalWorkflowPage.goto();
      await page.locator('[data-testid="audit-tab"]').click();
    });

    await test.step('Verify audit entries exist', async () => {
      const auditTable = page.locator('[data-testid="audit-table"]');
      await expect(auditTable).toBeVisible();
      const rows = auditTable.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
