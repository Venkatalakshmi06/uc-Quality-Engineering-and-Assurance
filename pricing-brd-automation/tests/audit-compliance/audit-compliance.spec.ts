import { test, expect } from '../../src/fixtures/pricing-fixtures';

/**
 * TC-AC: Audit & Compliance Test Suite
 * Covers BRD Section: Audit Trail and Compliance Requirements
 */
test.describe('Audit & Compliance @audit', () => {
  test('TC-AC-001: Verify price change creates audit log entry', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Change product price', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="manual-price"]').fill('155');
      await page.locator('[data-testid="save-price-btn"]').click();
    });

    await test.step('Verify audit log entry created', async () => {
      await page.locator('[data-testid="audit-tab"]').click();
      const auditTable = page.locator('[data-testid="audit-table"]');
      await expect(auditTable).toBeVisible();
      const lastRow = auditTable.locator('tbody tr:first-child');
      await expect(lastRow).toContainText('price_change');
    });
  });

  test('TC-AC-002: Verify audit log captures old and new values', async ({
    pricingPage,
    page,
  }) => {
    await test.step('View audit detail', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="audit-tab"]').click();
      const firstRow = page.locator('[data-testid="audit-table"] tbody tr:first-child');
      await firstRow.click();
    });

    await test.step('Verify old and new values are recorded', async () => {
      const oldValue = page.locator('[data-testid="audit-old-value"]');
      const newValue = page.locator('[data-testid="audit-new-value"]');
      await expect(oldValue).toBeVisible();
      await expect(newValue).toBeVisible();
    });
  });

  test('TC-AC-003: Verify audit log records user identity and timestamp', async ({
    pricingPage,
    page,
  }) => {
    await test.step('View audit log details', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="audit-tab"]').click();
    });

    await test.step('Verify user and timestamp columns', async () => {
      const userCol = page.locator('[data-testid="audit-table"] th:has-text("Changed By")');
      const timeCol = page.locator('[data-testid="audit-table"] th:has-text("Timestamp")');
      await expect(userCol).toBeVisible();
      await expect(timeCol).toBeVisible();
    });
  });

  test('TC-AC-004: Verify audit logs cannot be modified', async ({ pricingPage, page }) => {
    await test.step('Attempt to edit audit log entry', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="audit-tab"]').click();
    });

    await test.step('Verify audit entries are read-only', async () => {
      const editBtn = page.locator('[data-testid="edit-audit-btn"]');
      await expect(editBtn).toBeHidden();
    });
  });

  test('TC-AC-005: Verify approval reference is logged for approved changes', async ({
    pricingPage,
    page,
  }) => {
    await test.step('View approved price change audit', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="audit-tab"]').click();
      await page.locator('[data-testid="filter-approved"]').click();
    });

    await test.step('Verify approval reference exists', async () => {
      const approvalRef = page.locator('[data-testid="approval-reference"]');
      await expect(approvalRef).toBeVisible();
      const text = await approvalRef.textContent();
      expect(text?.length).toBeGreaterThan(0);
    });
  });
});
