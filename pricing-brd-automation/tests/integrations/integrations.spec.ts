import { test, expect } from '../../src/fixtures/pricing-fixtures';

/**
 * TC-IN: Integrations Test Suite
 * Covers BRD Section: System Integration Requirements (ERP, CRM, CPQ, E-commerce)
 */
test.describe('Integrations @integrations', () => {
  test('TC-IN-001: Verify ERP cost sync updates pricing module', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Trigger ERP sync', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="integrations-tab"]').click();
      await page.locator('[data-testid="sync-erp-btn"]').click();
    });

    await test.step('Verify cost data is updated from ERP', async () => {
      const syncStatus = page.locator('[data-testid="erp-sync-status"]');
      await expect(syncStatus).toContainText('Synced');
    });
  });

  test('TC-IN-002: Verify CRM customer data integration', async ({ pricingPage, page }) => {
    await test.step('Verify CRM customer data is available', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="integrations-tab"]').click();
      const crmStatus = page.locator('[data-testid="crm-sync-status"]');
      await expect(crmStatus).toBeVisible();
    });
  });

  test('TC-IN-003: Verify CPQ quote-to-price integration', async ({ pricingPage, page }) => {
    await test.step('Verify CPQ integration status', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="integrations-tab"]').click();
      const cpqStatus = page.locator('[data-testid="cpq-integration-status"]');
      await expect(cpqStatus).toBeVisible();
    });
  });

  test('TC-IN-004: Verify e-commerce price feed publication', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Trigger e-commerce price publication', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="integrations-tab"]').click();
      await page.locator('[data-testid="publish-ecommerce-btn"]').click();
    });

    await test.step('Verify publication status', async () => {
      const pubStatus = page.locator('[data-testid="ecommerce-pub-status"]');
      await expect(pubStatus).toContainText('Published');
    });
  });

  test('TC-IN-005: Handle ERP sync failure gracefully', async ({ pricingPage, page }) => {
    await test.step('Simulate ERP connection failure', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="integrations-tab"]').click();
      await page.locator('[data-testid="simulate-erp-failure"]').click();
    });

    await test.step('Verify graceful error handling', async () => {
      const error = page.locator('[data-testid="sync-error"]');
      await expect(error).toContainText('ERP sync failed');
    });
  });
});
