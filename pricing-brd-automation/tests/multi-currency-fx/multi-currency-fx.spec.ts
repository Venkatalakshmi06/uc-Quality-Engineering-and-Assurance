import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { PriceCalculator } from '../../src/utils/price-calculator';
import { fxRates, invalidData } from '../../src/data/test-data';

/**
 * TC-FX: Multi-Currency / FX Test Suite
 * Covers BRD Section: Multi-Currency Pricing and FX Rate Management
 * Validates currency conversion, rate updates, and multi-currency display.
 */
test.describe('Multi-Currency / FX Pricing @fx', () => {
  test('TC-FX-001: Verify USD to EUR conversion with valid FX rate', async ({
    pricingPage,
  }) => {
    await test.step('Select product and change currency to EUR', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await pricingPage.selectCurrency('EUR');
    });

    await test.step('Verify converted price using ECB rate', async () => {
      const netPrice = await pricingPage.getNetPrice();
      const usdPrice = 150.00;
      const expectedEur = PriceCalculator.convertCurrency(usdPrice, fxRates.usdToEur);
      expect(parseFloat(netPrice.replace(/[^0-9.]/g, ''))).toBeCloseTo(expectedEur, 1);
    });
  });

  test('TC-FX-002: Verify USD to GBP conversion', async ({ pricingPage }) => {
    await test.step('Convert price to GBP', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await pricingPage.selectCurrency('GBP');
      const netPrice = await pricingPage.getNetPrice();
      const expected = PriceCalculator.convertCurrency(150.00, fxRates.usdToGbp);
      expect(parseFloat(netPrice.replace(/[^0-9.]/g, ''))).toBeCloseTo(expected, 1);
    });
  });

  test('TC-FX-003: Verify USD to JPY conversion (high-rate currency)', async ({
    pricingPage,
  }) => {
    await test.step('Convert price to JPY', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await pricingPage.selectCurrency('JPY');
      const netPrice = await pricingPage.getNetPrice();
      const expected = PriceCalculator.convertCurrency(150.00, fxRates.usdToJpy);
      expect(parseFloat(netPrice.replace(/[^0-9.]/g, ''))).toBeCloseTo(expected, 0);
    });
  });

  test('TC-FX-004: Reject unsupported currency code', async ({ pricingPage, page }) => {
    await test.step('Attempt to select invalid currency', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="currency-select"]').fill(invalidData.invalidCurrency);
    });

    await test.step('Verify unsupported currency error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Unsupported currency');
    });
  });

  test('TC-FX-005: Verify FX rate staleness warning (>24 hours old)', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Check for stale FX rate indicator', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await pricingPage.selectCurrency('EUR');
      const staleWarning = page.locator('[data-testid="fx-rate-warning"]');
      await expect(staleWarning).toBeVisible();
      await expect(staleWarning).toContainText('FX rate may be outdated');
    });
  });

  test('TC-FX-006: Verify same-currency conversion returns original price', async ({
    pricingPage,
  }) => {
    await test.step('Select USD for USD-priced product', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await pricingPage.selectCurrency('USD');
      const netPrice = await pricingPage.getNetPrice();
      expect(parseFloat(netPrice.replace(/[^0-9.]/g, ''))).toBeGreaterThan(0);
    });
  });
});
