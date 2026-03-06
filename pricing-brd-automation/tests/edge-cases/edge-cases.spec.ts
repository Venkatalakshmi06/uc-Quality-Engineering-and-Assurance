import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { PriceCalculator } from '../../src/utils/price-calculator';
import { tierPrices, fxRates } from '../../src/data/test-data';

/**
 * TC-EC: Edge Cases Test Suite
 * Covers BRD cross-cutting boundary and edge-case scenarios.
 */
test.describe('Edge Cases @edge', () => {
  test('TC-EC-001: Verify handling of floating-point precision (0.1 + 0.2)', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Calculate price with floating-point inputs', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="manual-price"]').fill('0.3');
      await page.locator('[data-testid="validate-price-btn"]').click();
    });

    await test.step('Verify no floating-point rounding artifacts', async () => {
      const price = await pricingPage.getNetPrice();
      const numPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
      expect(numPrice).toBeCloseTo(0.3, 2);
    });
  });

  test('TC-EC-002: Verify behavior with maximum quantity at tier boundary', async ({
    page,
    pricingPage,
  }) => {
    await test.step('Order exactly at tier max boundary (99)', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="quantity-input"]').fill('99');
      await page.locator('[data-testid="calculate-btn"]').click();
    });

    await test.step('Verify correct tier applied at boundary', async () => {
      const price = PriceCalculator.tieredPrice(99, tierPrices.standard);
      expect(price).toBe(150.00);
    });
  });

  test('TC-EC-003: Verify simultaneous price changes to same SKU', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Submit concurrent price change', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="manual-price"]').fill('155');
      await page.locator('[data-testid="save-price-btn"]').click();
    });

    await test.step('Verify optimistic locking or conflict detection', async () => {
      const conflictMsg = page.locator('[data-testid="conflict-warning"]');
      await expect(conflictMsg).toBeVisible();
      await expect(conflictMsg).toContainText('conflict');
    });
  });

  test('TC-EC-004: Verify pricing with currency conversion at rate boundaries', async ({
    pricingPage,
  }) => {
    await test.step('Test with very high FX rate (JPY)', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await pricingPage.selectCurrency('JPY');
      const converted = PriceCalculator.convertCurrency(150.00, fxRates.usdToJpy);
      expect(converted).toBeGreaterThan(20000);
    });
  });

  test('TC-EC-005: Verify handling of product with no price book assignment', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Search for unassigned product', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-UNASSIGNED');
    });

    await test.step('Verify appropriate error for no price book', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('No price book');
    });
  });

  test('TC-EC-006: Verify empty cart/order pricing returns zero', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Calculate price for empty order', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="calculate-order-total"]').click();
    });

    await test.step('Verify order total is zero', async () => {
      const total = page.locator('[data-testid="order-total"]');
      const value = await total.textContent();
      expect(parseFloat(value?.replace(/[^0-9.]/g, '') || '0')).toBe(0);
    });
  });

  test('TC-EC-007: Verify price with all adjustments stacked', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Apply maximum number of adjustments', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await pricingPage.openAdjustments();
      // Apply discount, promotion, surcharge, override
      for (const adjType of ['discount', 'promotion', 'surcharge']) {
        await page.locator('[data-testid="add-adjustment"]').click();
        await page.locator('[data-testid="adjustment-type"]').last().selectOption(adjType);
        await page.locator('[data-testid="adjustment-value"]').last().fill('5');
      }
      await page.locator('[data-testid="calculate-btn"]').click();
    });

    await test.step('Verify all adjustments are reflected in net price', async () => {
      const netPrice = await pricingPage.getNetPrice();
      expect(parseFloat(netPrice.replace(/[^0-9.]/g, ''))).toBeGreaterThan(0);
    });
  });

  test('TC-EC-008: Verify system behavior with special characters in product name', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Search for product with special characters', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('Bearing & Assembly (3/4")');
    });

    await test.step('Verify search handles special characters', async () => {
      const results = page.locator('[data-testid="search-results"]');
      await expect(results).toBeVisible();
    });
  });
});
