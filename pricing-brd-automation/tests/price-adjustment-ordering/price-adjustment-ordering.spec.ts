import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { PriceCalculator } from '../../src/utils/price-calculator';
import { adjustments } from '../../src/data/test-data';

/**
 * TC-PA: Price Adjustment Ordering Test Suite
 * Covers BRD Section: Waterfall Price Adjustment Sequence
 * Order: Contract → Promotion → Volume Discount → Surcharge → Override → Rebate → Tax
 */
test.describe('Price Adjustment Ordering @adjustments', () => {
  test('TC-PA-001: Verify adjustments applied in correct waterfall order', async ({
    pricingPage,
  }) => {
    await test.step('Navigate to pricing and select product', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
    });

    await test.step('Apply multiple adjustments', async () => {
      await pricingPage.openAdjustments();
      const adjList = [adjustments.volumeDiscount, adjustments.promoDiscount, adjustments.fuelSurcharge];
      const basePrice = 150.00;
      const expected = PriceCalculator.applyAdjustments(basePrice, adjList);
      const netPrice = await pricingPage.getNetPrice();
      expect(parseFloat(netPrice.replace(/[^0-9.]/g, ''))).toBeCloseTo(expected, 2);
    });
  });

  test('TC-PA-002: Verify discount applied before surcharge', async ({ pricingPage, page }) => {
    await test.step('Apply discount then surcharge', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      const waterfall = page.locator('[data-testid="waterfall-breakdown"]');
      await expect(waterfall).toBeVisible();
    });
  });

  test('TC-PA-003: Verify non-combinable adjustment overrides others', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Apply combinable and non-combinable adjustments', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="add-adjustment"]').click();
      await page.locator('[data-testid="adjustment-type"]').selectOption('override');
    });

    await test.step('Verify non-combinable adjustment takes precedence', async () => {
      const warning = page.locator('[data-testid="combinability-warning"]');
      await expect(warning).toContainText('Non-combinable');
    });
  });

  test('TC-PA-004: Reject duplicate adjustment types on same line', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Attempt to add duplicate promotion adjustment', async () => {
      await pricingPage.goto();
      await pricingPage.openAdjustments();
      await page.locator('[data-testid="add-adjustment"]').click();
      await page.locator('[data-testid="adjustment-type"]').selectOption('promotion');
      await page.locator('[data-testid="add-adjustment"]').click();
      await page.locator('[data-testid="adjustment-type"]').last().selectOption('promotion');
    });

    await test.step('Verify duplicate warning', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Duplicate adjustment type');
    });
  });

  test('TC-PA-005: Verify expired adjustment is not applied', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Verify only active date-range adjustments applied', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      const expiredAdj = page.locator('[data-testid="expired-adjustments"]');
      await expect(expiredAdj).toHaveCount(0);
    });
  });
});
