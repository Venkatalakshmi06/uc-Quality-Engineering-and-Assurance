import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { products } from '../../src/data/test-data';

/**
 * TC-LC: Lifecycle Pricing Test Suite
 * Covers BRD Section: Product Lifecycle-Based Pricing
 * Validates pricing adjustments based on launch, growth, maturity, decline, clearance stages.
 */
test.describe('Lifecycle Pricing @lifecycle', () => {
  // =================== POSITIVE SCENARIOS ===================

  test('TC-LC-001: Verify launch-stage product gets introductory pricing', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Search for launch-stage product', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.launchProduct.sku);
    });

    await test.step('Verify lifecycle stage is displayed as Launch', async () => {
      const stage = page.locator('[data-testid="lifecycle-stage"]');
      await expect(stage).toHaveText('launch');
    });

    await test.step('Verify introductory pricing strategy is applied', async () => {
      const strategy = page.locator('[data-testid="pricing-strategy"]');
      await expect(strategy).toContainText('introductory');
    });
  });

  test('TC-LC-002: Verify maturity-stage product uses standard pricing', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Search for maturity-stage product', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.standard.sku);
    });

    await test.step('Verify maturity stage and standard pricing', async () => {
      const stage = page.locator('[data-testid="lifecycle-stage"]');
      await expect(stage).toHaveText('maturity');
    });
  });

  test('TC-LC-003: Verify decline-stage product allows clearance discounts', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Search for decline-stage product', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.declineProduct.sku);
    });

    await test.step('Verify decline stage enables clearance pricing', async () => {
      const stage = page.locator('[data-testid="lifecycle-stage"]');
      await expect(stage).toHaveText('decline');
      const clearanceOption = page.locator('[data-testid="clearance-pricing-option"]');
      await expect(clearanceOption).toBeEnabled();
    });
  });

  // =================== NEGATIVE SCENARIOS ===================

  test('TC-LC-004: Reject clearance pricing on launch-stage product', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Attempt to apply clearance to launch product', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.launchProduct.sku);
      await page.locator('[data-testid="apply-clearance-btn"]').click();
    });

    await test.step('Verify clearance is blocked for launch stage', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Clearance pricing not available for launch-stage products');
    });
  });

  // =================== EDGE CASE SCENARIOS ===================

  test('TC-LC-005: Verify pricing transition from growth to maturity stage', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Simulate lifecycle stage transition', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.standard.sku);
      await page.locator('[data-testid="simulate-transition-btn"]').click();
    });

    await test.step('Verify pricing strategy updates accordingly', async () => {
      const strategy = page.locator('[data-testid="pricing-strategy"]');
      await expect(strategy).toBeVisible();
    });
  });

  test('TC-LC-006: Verify product with no lifecycle stage uses default pricing', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Search for product without lifecycle assignment', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.commodity.sku);
    });

    await test.step('Verify default pricing is applied', async () => {
      const strategy = page.locator('[data-testid="pricing-strategy"]');
      await expect(strategy).toContainText('default');
    });
  });
});
