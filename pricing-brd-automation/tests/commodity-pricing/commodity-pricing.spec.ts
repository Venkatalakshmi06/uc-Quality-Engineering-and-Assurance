import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { costs } from '../../src/data/test-data';

/**
 * TC-CM: Commodity Pricing Test Suite
 * Covers BRD Section: Commodity / Index-Based Pricing
 * Validates pricing tied to commodity indices with automatic updates.
 */
test.describe('Commodity Pricing @commodity', () => {
  test('TC-CM-001: Verify index-based cost updates commodity price', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Navigate and select commodity product', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-2001');
    });

    await test.step('Verify index-based cost is displayed', async () => {
      const indexCost = page.locator('[data-testid="index-cost"]');
      await expect(indexCost).toContainText(String(costs.commodity.indexBasedCost));
    });
  });

  test('TC-CM-002: Verify commodity price recalculates on index change', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Simulate commodity index update', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-2001');
      await page.locator('[data-testid="simulate-index-change"]').click();
      await page.locator('[data-testid="new-index-value"]').fill('55.00');
      await page.locator('[data-testid="apply-index-btn"]').click();
    });

    await test.step('Verify price is recalculated', async () => {
      const netPrice = await pricingPage.getNetPrice();
      expect(parseFloat(netPrice.replace(/[^0-9.]/g, ''))).toBeGreaterThan(0);
    });
  });

  test('TC-CM-003: Verify commodity tiered pricing works correctly', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select commodity with volume tiers', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-2001');
      await page.locator('[data-testid="quantity-input"]').fill('3000');
      await page.locator('[data-testid="calculate-btn"]').click();
    });

    await test.step('Verify medium tier applied', async () => {
      const tier = page.locator('[data-testid="applied-tier"]');
      await expect(tier).toContainText('Medium');
    });
  });

  test('TC-CM-004: Reject commodity pricing with missing index feed', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Simulate missing index data', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-2001');
      await page.locator('[data-testid="simulate-missing-index"]').click();
    });

    await test.step('Verify error for missing index', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Commodity index data unavailable');
    });
  });

  test('TC-CM-005: Verify commodity price cap/floor enforcement', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Simulate extreme index spike', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-2001');
      await page.locator('[data-testid="simulate-index-change"]').click();
      await page.locator('[data-testid="new-index-value"]').fill('999.99');
      await page.locator('[data-testid="apply-index-btn"]').click();
    });

    await test.step('Verify price cap is enforced', async () => {
      const warning = page.locator('[data-testid="price-cap-warning"]');
      await expect(warning).toBeVisible();
    });
  });
});
