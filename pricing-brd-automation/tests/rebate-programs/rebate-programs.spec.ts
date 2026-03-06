import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { PriceCalculator } from '../../src/utils/price-calculator';
import { rebatePrograms, customers } from '../../src/data/test-data';

/**
 * TC-RB: Rebate Programs Test Suite
 * Covers BRD Section: Rebate Accrual and Settlement
 */
test.describe('Rebate Programs @rebate', () => {
  test('TC-RB-001: Verify rebate accrual at standard rate', async ({ pricingPage, page }) => {
    await test.step('Navigate and select customer with rebate program', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="customer-select"]').selectOption(customers.enterprise.customerId);
      await page.locator('[data-testid="rebate-tab"]').click();
    });

    await test.step('Verify rebate accrual calculation', async () => {
      const salesVolume = 150000;
      const expected = PriceCalculator.rebateAccrual(salesVolume, rebatePrograms.standard.accrualRate);
      const accrual = page.locator('[data-testid="rebate-accrual"]');
      const value = await accrual.textContent();
      expect(parseFloat(value?.replace(/[^0-9.]/g, '') || '0')).toBeCloseTo(expected, 2);
    });
  });

  test('TC-RB-002: Verify credit memo settlement method', async ({ pricingPage, page }) => {
    await test.step('View rebate settlement details', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="customer-select"]').selectOption(customers.enterprise.customerId);
      await page.locator('[data-testid="rebate-tab"]').click();
    });

    await test.step('Verify settlement method is credit memo', async () => {
      const method = page.locator('[data-testid="settlement-method"]');
      await expect(method).toContainText('credit_memo');
    });
  });

  test('TC-RB-003: Reject rebate for ineligible customer', async ({ pricingPage, page }) => {
    await test.step('Select customer not enrolled in rebate program', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="customer-select"]').selectOption(customers.smallBusiness.customerId);
      await page.locator('[data-testid="rebate-tab"]').click();
    });

    await test.step('Verify no rebate programs available', async () => {
      const noRebate = page.locator('[data-testid="no-rebate-message"]');
      await expect(noRebate).toContainText('No active rebate programs');
    });
  });

  test('TC-RB-004: Verify rebate does not reduce price below cost', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Apply maximum rebate scenario', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="customer-select"]').selectOption(customers.enterprise.customerId);
      await page.locator('[data-testid="rebate-tab"]').click();
      await page.locator('[data-testid="simulate-max-rebate"]').click();
    });

    await test.step('Verify floor protection against cost', async () => {
      const warning = page.locator('[data-testid="rebate-floor-warning"]');
      await expect(warning).toBeVisible();
      await expect(warning).toContainText('Rebate limited');
    });
  });
});
