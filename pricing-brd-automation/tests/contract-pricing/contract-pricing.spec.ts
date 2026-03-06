import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { PriceCalculator } from '../../src/utils/price-calculator';
import { customers } from '../../src/data/test-data';

/**
 * TC-CT: Contract Pricing Test Suite
 * Covers BRD Section: Contract-Based Pricing with Protection Windows and Escalators
 */
test.describe('Contract Pricing @contract', () => {
  test('TC-CT-001: Verify active contract price overrides list price', async ({
    contractPricingPage,
    page,
  }) => {
    await test.step('Navigate to contract pricing', async () => {
      await contractPricingPage.goto();
    });

    await test.step('Select customer with active contract', async () => {
      await page.locator('[data-testid="customer-select"]').selectOption(customers.enterprise.customerId);
      await page.locator('[data-testid="load-contract-btn"]').click();
    });

    await test.step('Verify contract price is applied instead of list price', async () => {
      const contractPrice = page.locator('[data-testid="contract-price"]');
      await expect(contractPrice).toContainText('120.00');
    });
  });

  test('TC-CT-002: Verify contract price protection during protection window', async ({
    contractPricingPage,
    page,
  }) => {
    await test.step('Load active contract with protection window', async () => {
      await contractPricingPage.goto();
      await page.locator('[data-testid="customer-select"]').selectOption(customers.enterprise.customerId);
      await page.locator('[data-testid="load-contract-btn"]').click();
    });

    await test.step('Verify protection window is displayed', async () => {
      const protection = page.locator('[data-testid="protection-window"]');
      await expect(protection).toContainText('90 days');
    });
  });

  test('TC-CT-003: Verify annual escalator applies correctly', async ({
    contractPricingPage,
    page,
  }) => {
    await test.step('View Year 2 escalated price', async () => {
      await contractPricingPage.goto();
      await page.locator('[data-testid="customer-select"]').selectOption(customers.enterprise.customerId);
      await page.locator('[data-testid="load-contract-btn"]').click();
      await page.locator('[data-testid="view-year-2"]').click();
    });

    await test.step('Verify escalated price calculation', async () => {
      const expected = PriceCalculator.contractEscalation(120.00, 3, 1);
      const escalatedPrice = page.locator('[data-testid="escalated-price"]');
      const value = await escalatedPrice.textContent();
      expect(parseFloat(value?.replace(/[^0-9.]/g, '') || '0')).toBeCloseTo(expected, 2);
    });
  });

  test('TC-CT-004: Reject expired contract for pricing', async ({
    contractPricingPage,
    page,
  }) => {
    await test.step('Attempt to use expired contract', async () => {
      await contractPricingPage.goto();
      await page.locator('[data-testid="customer-select"]').selectOption(customers.midMarket.customerId);
      await page.locator('[data-testid="load-contract-btn"]').click();
    });

    await test.step('Verify expired contract warning', async () => {
      const warning = page.locator('[data-testid="contract-expired-warning"]');
      await expect(warning).toContainText('Contract expired');
    });
  });

  test('TC-CT-005: Verify contract creation with valid date range', async ({
    contractPricingPage,
  }) => {
    await test.step('Create new contract', async () => {
      await contractPricingPage.goto();
      await contractPricingPage.createContract(
        customers.enterprise.customerId, '2026-04-01', '2027-03-31', '90', '3',
      );
      await contractPricingPage.addContractItem('SKU-1001', '125.00');
      await contractPricingPage.saveContract();
    });

    await test.step('Verify contract is saved successfully', async () => {
      const status = await contractPricingPage.getStatus();
      expect(status).toContain('Active');
    });
  });

  test('TC-CT-006: Reject contract with end date before start date', async ({
    contractPricingPage,
    page,
  }) => {
    await test.step('Create contract with invalid dates', async () => {
      await contractPricingPage.goto();
      await contractPricingPage.createContract(
        customers.enterprise.customerId, '2027-01-01', '2026-01-01', '90',
      );
      await contractPricingPage.saveContract();
    });

    await test.step('Verify date validation error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('End date must be after start date');
    });
  });
});
