import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { PriceCalculator } from '../../src/utils/price-calculator';
import { invalidData } from '../../src/data/test-data';

/**
 * TC-CP: Cost-Plus Pricing Test Suite
 * Covers BRD Section: Cost-Plus Pricing Model
 * Formula: Price = Cost × (1 + Markup%) + Adders (freight, duties, overhead)
 */
test.describe('Cost-Plus Pricing @cost-plus', () => {
  // =================== POSITIVE SCENARIOS ===================

  test('TC-CP-001: Verify cost-plus price calculation with valid markup and adders', async ({
    costPlusPage,
  }) => {
    await test.step('Navigate to cost-plus pricing module', async () => {
      await costPlusPage.goto();
    });

    await test.step('Enter cost, markup, and adders', async () => {
      await costPlusPage.configureCostPlus('100', '25', '8', '5', '2');
    });

    await test.step('Calculate price and verify result', async () => {
      const result = await costPlusPage.calculatePrice();
      // Expected: $100 × 1.25 + $15 = $140.00
      const expected = PriceCalculator.costPlusPrice(100, 25, 15);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expected, 2);
    });
  });

  test('TC-CP-002: Verify cost-plus with zero adders', async ({ costPlusPage }) => {
    await test.step('Navigate and configure with zero adders', async () => {
      await costPlusPage.goto();
      await costPlusPage.configureCostPlus('200', '30', '0', '0', '0');
    });

    await test.step('Calculate and verify price equals cost × markup only', async () => {
      const result = await costPlusPage.calculatePrice();
      const expected = PriceCalculator.costPlusPrice(200, 30, 0);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expected, 2);
    });
  });

  test('TC-CP-003: Verify cost-plus with zero markup and positive adders', async ({
    costPlusPage,
  }) => {
    await test.step('Navigate and configure with zero markup', async () => {
      await costPlusPage.goto();
      await costPlusPage.configureCostPlus('150', '0', '10', '5', '3');
    });

    await test.step('Verify price equals cost + adders only', async () => {
      const result = await costPlusPage.calculatePrice();
      const expected = PriceCalculator.costPlusPrice(150, 0, 18);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expected, 2);
    });
  });

  test('TC-CP-004: Verify cost-plus price updates when cost is changed in ERP', async ({
    costPlusPage,
  }) => {
    await test.step('Configure initial cost-plus pricing', async () => {
      await costPlusPage.goto();
      await costPlusPage.configureCostPlus('100', '25', '8', '5', '2');
      await costPlusPage.savePricing();
    });

    await test.step('Update cost and verify recalculation', async () => {
      await costPlusPage.configureCostPlus('120', '25', '8', '5', '2');
      const result = await costPlusPage.calculatePrice();
      const expected = PriceCalculator.costPlusPrice(120, 25, 15);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expected, 2);
    });
  });

  test('TC-CP-005: Verify cost-plus with high markup percentage', async ({ costPlusPage }) => {
    await test.step('Configure with 100% markup', async () => {
      await costPlusPage.goto();
      await costPlusPage.configureCostPlus('50', '100', '5', '3', '2');
    });

    await test.step('Verify price doubles plus adders', async () => {
      const result = await costPlusPage.calculatePrice();
      const expected = PriceCalculator.costPlusPrice(50, 100, 10);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expected, 2);
    });
  });

  // =================== NEGATIVE SCENARIOS ===================

  test('TC-CP-006: Reject negative cost value', async ({ costPlusPage }) => {
    await test.step('Enter negative cost', async () => {
      await costPlusPage.goto();
      await costPlusPage.configureCostPlus(String(invalidData.negativeCost), '25', '8', '5', '2');
    });

    await test.step('Verify error message is shown', async () => {
      await costPlusPage.calculatePrice();
      const error = await costPlusPage.getErrorMessage();
      expect(error).toContain('Cost must be a positive value');
    });
  });

  test('TC-CP-007: Reject negative markup percentage', async ({ costPlusPage }) => {
    await test.step('Enter negative markup', async () => {
      await costPlusPage.goto();
      await costPlusPage.configureCostPlus('100', String(invalidData.negativeMarkup), '8', '5', '2');
    });

    await test.step('Verify validation error', async () => {
      await costPlusPage.calculatePrice();
      const error = await costPlusPage.getErrorMessage();
      expect(error).toContain('Markup percentage cannot be negative');
    });
  });

  test('TC-CP-008: Reject cost-plus calculation with missing cost', async ({ costPlusPage }) => {
    await test.step('Leave cost empty', async () => {
      await costPlusPage.goto();
      await costPlusPage.configureCostPlus('', '25', '8', '5', '2');
    });

    await test.step('Verify validation error for required cost', async () => {
      await costPlusPage.calculatePrice();
      const error = await costPlusPage.getErrorMessage();
      expect(error).toContain('Cost is required');
    });
  });

  // =================== EDGE CASE SCENARIOS ===================

  test('TC-CP-009: Verify cost-plus with very large cost value', async ({ costPlusPage }) => {
    await test.step('Enter maximum integer cost', async () => {
      await costPlusPage.goto();
      await costPlusPage.configureCostPlus('999999999.99', '25', '8', '5', '2');
    });

    await test.step('Verify system handles large values without overflow', async () => {
      const result = await costPlusPage.calculatePrice();
      const expected = PriceCalculator.costPlusPrice(999999999.99, 25, 15);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expected, 0);
    });
  });

  test('TC-CP-010: Verify cost-plus with fractional cent values', async ({ costPlusPage }) => {
    await test.step('Enter cost with sub-cent precision', async () => {
      await costPlusPage.goto();
      await costPlusPage.configureCostPlus('99.999', '33.333', '7.777', '4.444', '1.111');
    });

    await test.step('Verify result is rounded to 2 decimal places', async () => {
      const result = await costPlusPage.calculatePrice();
      const decimals = result.split('.')[1]?.replace(/[^0-9]/g, '') || '';
      expect(decimals.length).toBeLessThanOrEqual(2);
    });
  });

  test('TC-CP-011: Verify cost-plus with zero cost', async ({ costPlusPage }) => {
    await test.step('Enter zero cost with markup', async () => {
      await costPlusPage.goto();
      await costPlusPage.configureCostPlus('0', '25', '8', '5', '2');
    });

    await test.step('Verify price equals adders only (0 × 1.25 + 15 = 15)', async () => {
      const result = await costPlusPage.calculatePrice();
      const expected = PriceCalculator.costPlusPrice(0, 25, 15);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expected, 2);
    });
  });
});
