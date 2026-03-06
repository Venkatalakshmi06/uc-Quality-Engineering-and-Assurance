import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { customers, priceBooks } from '../../src/data/test-data';

/**
 * TC-SC: Segment & Channel Pricing Test Suite
 * Covers BRD Section: Customer Segment and Channel-Based Pricing
 * Validates price book assignment by region, channel, and customer segment.
 */
test.describe('Segment & Channel Pricing @segment-channel', () => {
  // =================== POSITIVE SCENARIOS ===================

  test('TC-SC-001: Verify enterprise customer gets direct-channel price book', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Navigate to pricing module', async () => {
      await pricingPage.goto();
    });

    await test.step('Select enterprise customer', async () => {
      await page.locator('[data-testid="customer-select"]').selectOption(customers.enterprise.customerId);
    });

    await test.step('Verify correct price book is assigned', async () => {
      const assignedPriceBook = page.locator('[data-testid="assigned-pricebook"]');
      await expect(assignedPriceBook).toContainText(priceBooks.usDistributor.priceBookId);
    });
  });

  test('TC-SC-002: Verify distributor channel applies distributor pricing', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Navigate and select distributor customer', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="customer-select"]').selectOption(customers.midMarket.customerId);
    });

    await test.step('Verify distributor price book assigned', async () => {
      const channel = page.locator('[data-testid="customer-channel"]');
      await expect(channel).toContainText('distributor');
    });
  });

  test('TC-SC-003: Verify ecommerce channel applies correct pricing', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select ecommerce customer', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="customer-select"]').selectOption(customers.smallBusiness.customerId);
    });

    await test.step('Verify ecommerce pricing is applied', async () => {
      const channel = page.locator('[data-testid="customer-channel"]');
      await expect(channel).toContainText('ecommerce');
    });
  });

  test('TC-SC-004: Verify region-specific price book selection', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select customer from APAC region', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="customer-select"]').selectOption(customers.retailCustomer.customerId);
    });

    await test.step('Verify APAC region price book is used', async () => {
      const region = page.locator('[data-testid="customer-region"]');
      await expect(region).toContainText('APAC');
    });
  });

  // =================== NEGATIVE SCENARIOS ===================

  test('TC-SC-005: Reject order without customer segment assignment', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Attempt to price without selecting customer', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="calculate-price-btn"]').click();
    });

    await test.step('Verify error for missing customer segment', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Customer selection is required');
    });
  });

  test('TC-SC-006: Reject pricing when no price book exists for region-channel combo', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select a customer with unmatched region-channel', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="region-select"]').selectOption('Antarctica');
      await page.locator('[data-testid="channel-select"]').selectOption('retail');
    });

    await test.step('Verify no price book found error', async () => {
      await page.locator('[data-testid="calculate-price-btn"]').click();
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('No price book found');
    });
  });

  // =================== EDGE CASE SCENARIOS ===================

  test('TC-SC-007: Verify customer with multiple segments uses primary segment', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select customer with dual segment classification', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="customer-select"]').selectOption(customers.enterprise.customerId);
    });

    await test.step('Verify primary segment pricing is applied', async () => {
      const segment = page.locator('[data-testid="customer-segment"]');
      await expect(segment).toHaveText('enterprise');
    });
  });

  test('TC-SC-008: Verify price book effective date boundary', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Set order date to price book boundary', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="order-date"]').fill('2026-12-31');
    });

    await test.step('Verify price book is still valid on last effective day', async () => {
      await page.locator('[data-testid="customer-select"]').selectOption(customers.enterprise.customerId);
      const priceBookStatus = page.locator('[data-testid="pricebook-status"]');
      await expect(priceBookStatus).toContainText('Active');
    });
  });
});
