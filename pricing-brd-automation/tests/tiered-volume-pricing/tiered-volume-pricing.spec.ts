import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { PriceCalculator } from '../../src/utils/price-calculator';
import { tierPrices } from '../../src/data/test-data';

/**
 * TC-TV: Tiered / Volume Pricing Test Suite
 * Covers BRD Section: Volume-Based Pricing Tiers
 * Validates correct tier selection and price application based on quantity.
 */
test.describe('Tiered / Volume Pricing @tiered', () => {
  // =================== POSITIVE SCENARIOS ===================

  test('TC-TV-001: Verify Tier 1 unit price for small quantity', async ({
    tieredPricingPage,
  }) => {
    await test.step('Navigate to tiered pricing', async () => {
      await tieredPricingPage.goto();
    });

    await test.step('Simulate quantity within Tier 1 (1-99)', async () => {
      const result = await tieredPricingPage.simulateQuantity('50');
      const expectedPrice = PriceCalculator.tieredPrice(50, tierPrices.standard);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expectedPrice, 2);
    });

    await test.step('Verify Tier 1 label is applied', async () => {
      const tier = await tieredPricingPage.getAppliedTier();
      expect(tier).toContain('Tier 1');
    });
  });

  test('TC-TV-002: Verify Tier 2 unit price at boundary (qty=100)', async ({
    tieredPricingPage,
  }) => {
    await test.step('Simulate exact boundary quantity', async () => {
      await tieredPricingPage.goto();
      const result = await tieredPricingPage.simulateQuantity('100');
      const expectedPrice = PriceCalculator.tieredPrice(100, tierPrices.standard);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expectedPrice, 2);
    });
  });

  test('TC-TV-003: Verify Tier 3 pricing for mid-volume order', async ({
    tieredPricingPage,
  }) => {
    await test.step('Simulate Tier 3 quantity', async () => {
      await tieredPricingPage.goto();
      const result = await tieredPricingPage.simulateQuantity('750');
      const expectedPrice = PriceCalculator.tieredPrice(750, tierPrices.standard);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expectedPrice, 2);
    });
  });

  test('TC-TV-004: Verify Tier 4 (open-ended) for large volume', async ({
    tieredPricingPage,
  }) => {
    await test.step('Simulate very large quantity in open-ended tier', async () => {
      await tieredPricingPage.goto();
      const result = await tieredPricingPage.simulateQuantity('5000');
      const expectedPrice = PriceCalculator.tieredPrice(5000, tierPrices.standard);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expectedPrice, 2);
    });
  });

  // =================== NEGATIVE SCENARIOS ===================

  test('TC-TV-005: Reject zero quantity for tier pricing', async ({ tieredPricingPage }) => {
    await test.step('Enter zero quantity', async () => {
      await tieredPricingPage.goto();
      const result = await tieredPricingPage.simulateQuantity('0');
      expect(result).toContain('Quantity must be at least 1');
    });
  });

  test('TC-TV-006: Reject negative quantity for tier pricing', async ({
    tieredPricingPage,
  }) => {
    await test.step('Enter negative quantity', async () => {
      await tieredPricingPage.goto();
      const result = await tieredPricingPage.simulateQuantity('-10');
      expect(result).toContain('Invalid quantity');
    });
  });

  test('TC-TV-007: Reject non-numeric quantity input', async ({ tieredPricingPage }) => {
    await test.step('Enter text instead of number', async () => {
      await tieredPricingPage.goto();
      const result = await tieredPricingPage.simulateQuantity('abc');
      expect(result).toContain('Invalid');
    });
  });

  // =================== EDGE CASE SCENARIOS ===================

  test('TC-TV-008: Verify tier boundary - quantity 99 vs 100', async ({
    tieredPricingPage,
  }) => {
    await test.step('Verify qty 99 gets Tier 1 price', async () => {
      await tieredPricingPage.goto();
      const result99 = await tieredPricingPage.simulateQuantity('99');
      const tier1Price = PriceCalculator.tieredPrice(99, tierPrices.standard);
      expect(parseFloat(result99.replace(/[^0-9.]/g, ''))).toBeCloseTo(tier1Price, 2);
    });

    await test.step('Verify qty 100 gets Tier 2 price (lower)', async () => {
      const result100 = await tieredPricingPage.simulateQuantity('100');
      const tier2Price = PriceCalculator.tieredPrice(100, tierPrices.standard);
      expect(parseFloat(result100.replace(/[^0-9.]/g, ''))).toBeCloseTo(tier2Price, 2);
      expect(tier2Price).toBeLessThan(PriceCalculator.tieredPrice(99, tierPrices.standard));
    });
  });

  test('TC-TV-009: Verify tier pricing with maximum integer quantity', async ({
    tieredPricingPage,
  }) => {
    await test.step('Simulate with very large quantity', async () => {
      await tieredPricingPage.goto();
      const result = await tieredPricingPage.simulateQuantity('999999');
      const expectedPrice = PriceCalculator.tieredPrice(999999, tierPrices.standard);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expectedPrice, 2);
    });
  });

  test('TC-TV-010: Verify single-unit quantity gets Tier 1 price', async ({
    tieredPricingPage,
  }) => {
    await test.step('Simulate minimum quantity of 1', async () => {
      await tieredPricingPage.goto();
      const result = await tieredPricingPage.simulateQuantity('1');
      const expectedPrice = PriceCalculator.tieredPrice(1, tierPrices.standard);
      expect(parseFloat(result.replace(/[^0-9.]/g, ''))).toBeCloseTo(expectedPrice, 2);
    });
  });
});
