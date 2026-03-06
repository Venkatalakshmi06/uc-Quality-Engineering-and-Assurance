import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { PriceCalculator } from '../../src/utils/price-calculator';
import { products, freightZones } from '../../src/data/test-data';

/**
 * TC-OB: Oversized / Bulky Items Test Suite
 * Covers BRD Section: Dimensional Weight Pricing for Oversized Items
 * Validates DIM weight calculation and freight surcharge application.
 */
test.describe('Oversized / Bulky Items @oversized', () => {
  test('TC-OB-001: Verify dimensional weight calculation', async ({ pricingPage, page }) => {
    await test.step('Select oversized product', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.oversized.sku);
    });

    await test.step('Verify DIM weight is calculated correctly', async () => {
      const dims = products.oversized.dimensions!;
      const dimWeight = PriceCalculator.dimensionalWeight(dims, freightZones.domestic.dimWeightFactor);
      const displayed = page.locator('[data-testid="dim-weight"]');
      const value = await displayed.textContent();
      expect(parseFloat(value?.replace(/[^0-9.]/g, '') || '0')).toBeCloseTo(dimWeight, 1);
    });
  });

  test('TC-OB-002: Verify freight uses greater of actual vs DIM weight', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Verify billable weight selection', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.oversized.sku);
      const dims = products.oversized.dimensions!;
      const dimWeight = PriceCalculator.dimensionalWeight(dims, freightZones.domestic.dimWeightFactor);
      const billable = Math.max(dims.actualWeight, dimWeight);
      const billableDisplay = page.locator('[data-testid="billable-weight"]');
      const value = await billableDisplay.textContent();
      expect(parseFloat(value?.replace(/[^0-9.]/g, '') || '0')).toBeCloseTo(billable, 1);
    });
  });

  test('TC-OB-003: Verify freight cost for oversized domestic shipment', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Calculate freight for domestic zone', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.oversized.sku);
      await page.locator('[data-testid="freight-zone"]').selectOption('US Domestic');
    });

    await test.step('Verify freight cost calculation', async () => {
      const dims = products.oversized.dimensions!;
      const expected = PriceCalculator.freightCost(
        dims, freightZones.domestic.dimWeightFactor, freightZones.domestic.baseCost,
      );
      const freightCost = page.locator('[data-testid="freight-cost"]');
      const value = await freightCost.textContent();
      expect(parseFloat(value?.replace(/[^0-9.]/g, '') || '0')).toBeCloseTo(expected, 0);
    });
  });

  test('TC-OB-004: Reject oversized item with missing dimensions', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Attempt pricing without dimensions', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="product-search"]').fill('SKU-NODIM');
      await page.locator('[data-testid="search-button"]').click();
      await page.locator('[data-testid="calculate-freight-btn"]').click();
    });

    await test.step('Verify error for missing dimensions', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Product dimensions required');
    });
  });
});
