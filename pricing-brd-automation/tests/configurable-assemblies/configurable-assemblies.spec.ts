import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { PriceCalculator } from '../../src/utils/price-calculator';
import { bomComponents } from '../../src/data/test-data';

/**
 * TC-CA: Configurable Assemblies Test Suite
 * Covers BRD Section: BOM Roll-Up Pricing for Configurable Products
 * Validates dynamic pricing based on selected optional components.
 */
test.describe('Configurable Assemblies @configurable', () => {
  test('TC-CA-001: Verify BOM roll-up with mandatory components only', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select configurable product', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-5001');
    });

    await test.step('Verify base price from mandatory components', async () => {
      const expected = PriceCalculator.bomRollup(bomComponents.hydraulicPump, []);
      const basePrice = page.locator('[data-testid="base-price"]');
      const value = await basePrice.textContent();
      expect(parseFloat(value?.replace(/[^0-9.]/g, '') || '0')).toBeCloseTo(expected, 2);
    });
  });

  test('TC-CA-002: Verify BOM roll-up with optional components selected', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select optional components', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-5001');
      await page.locator('[data-testid="option-COMP-004"]').check();
      await page.locator('[data-testid="option-COMP-005"]').check();
      await page.locator('[data-testid="recalculate-btn"]').click();
    });

    await test.step('Verify total includes optional components', async () => {
      const expected = PriceCalculator.bomRollup(
        bomComponents.hydraulicPump, ['COMP-004', 'COMP-005'],
      );
      const totalPrice = page.locator('[data-testid="total-price"]');
      const value = await totalPrice.textContent();
      expect(parseFloat(value?.replace(/[^0-9.]/g, '') || '0')).toBeCloseTo(expected, 2);
    });
  });

  test('TC-CA-003: Verify adding single optional component updates price', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Add only premium seal kit', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-5001');
      await page.locator('[data-testid="option-COMP-004"]').check();
      await page.locator('[data-testid="recalculate-btn"]').click();
    });

    await test.step('Verify price reflects single optional', async () => {
      const expected = PriceCalculator.bomRollup(bomComponents.hydraulicPump, ['COMP-004']);
      const totalPrice = page.locator('[data-testid="total-price"]');
      const value = await totalPrice.textContent();
      expect(parseFloat(value?.replace(/[^0-9.]/g, '') || '0')).toBeCloseTo(expected, 2);
    });
  });

  test('TC-CA-004: Reject configurable product with missing mandatory component', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Simulate missing mandatory component', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-5001');
      await page.locator('[data-testid="remove-COMP-001"]').click();
      await page.locator('[data-testid="recalculate-btn"]').click();
    });

    await test.step('Verify error for incomplete BOM', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Mandatory component missing');
    });
  });
});
