import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { PriceCalculator } from '../../src/utils/price-calculator';
import { costs } from '../../src/data/test-data';

/**
 * TC-MG: Margin Guardrails Test Suite
 * Covers BRD Section: Minimum Margin Enforcement
 * Validates that prices cannot be set below the configured minimum margin threshold.
 */
test.describe('Margin Guardrails @margin', () => {
  test('TC-MG-001: Verify price meeting minimum margin is accepted', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Set price with 30% margin (above 20% minimum)', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      const cost = costs.standard.standardCost;
      const price = cost / (1 - 0.30); // ~142.86 for 30% margin
      await page.locator('[data-testid="manual-price"]').fill(String(Math.round(price * 100) / 100));
      await page.locator('[data-testid="validate-price-btn"]').click();
    });

    await test.step('Verify margin check passes', async () => {
      const marginStatus = page.locator('[data-testid="margin-status"]');
      await expect(marginStatus).toContainText('Approved');
    });
  });

  test('TC-MG-002: Block price below minimum margin threshold', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Set price with 5% margin (below 20% minimum)', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="manual-price"]').fill('105');
      await page.locator('[data-testid="validate-price-btn"]').click();
    });

    await test.step('Verify margin violation warning', async () => {
      const warning = page.locator('[data-testid="margin-warning"]');
      await expect(warning).toContainText('below minimum margin');
    });
  });

  test('TC-MG-003: Verify margin calculation display is accurate', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Enter price and verify margin percentage', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="manual-price"]').fill('150');
      await page.locator('[data-testid="validate-price-btn"]').click();
      const expected = PriceCalculator.marginPercent(150, costs.standard.standardCost);
      const displayed = page.locator('[data-testid="margin-percent"]');
      const value = await displayed.textContent();
      expect(parseFloat(value?.replace(/[^0-9.]/g, '') || '0')).toBeCloseTo(expected, 1);
    });
  });

  test('TC-MG-004: Verify margin guardrail triggers approval workflow for override', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Set price below margin and request override', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="manual-price"]').fill('102');
      await page.locator('[data-testid="validate-price-btn"]').click();
      await page.locator('[data-testid="request-override-btn"]').click();
    });

    await test.step('Verify approval workflow is initiated', async () => {
      const approvalStatus = page.locator('[data-testid="approval-status"]');
      await expect(approvalStatus).toContainText('Pending Approval');
    });
  });

  test('TC-MG-005: Verify exact minimum margin boundary is accepted', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Set price at exactly minimum margin (20%)', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      const cost = costs.standard.standardCost;
      const priceAtExactMargin = cost / (1 - 0.20); // 125.00
      await page.locator('[data-testid="manual-price"]').fill(String(priceAtExactMargin));
      await page.locator('[data-testid="validate-price-btn"]').click();
    });

    await test.step('Verify price at exact boundary is accepted', async () => {
      const marginStatus = page.locator('[data-testid="margin-status"]');
      await expect(marginStatus).toContainText('Approved');
    });
  });
});
