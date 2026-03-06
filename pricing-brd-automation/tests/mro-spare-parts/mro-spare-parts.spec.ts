import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { supersessionMaps } from '../../src/data/test-data';

/**
 * TC-MR: MRO / Spare Parts Pricing Test Suite
 * Covers BRD Section: Supersession & Criticality Pricing for MRO Parts
 * Validates part supersession mapping and criticality-based pricing.
 */
test.describe('MRO / Spare Parts Pricing @mro', () => {
  test('TC-MR-001: Verify supersession maps old part to new part price', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Search for superseded part number', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(supersessionMaps[0].oldPartNumber);
    });

    await test.step('Verify redirect to new part with pricing', async () => {
      const redirectNotice = page.locator('[data-testid="supersession-notice"]');
      await expect(redirectNotice).toContainText(supersessionMaps[0].newPartNumber);
    });
  });

  test('TC-MR-002: Verify critical spare part premium pricing', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select critical MRO spare', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-7001');
    });

    await test.step('Verify criticality premium is applied', async () => {
      const criticality = page.locator('[data-testid="criticality-flag"]');
      await expect(criticality).toBeVisible();
    });
  });

  test('TC-MR-003: Verify emergency order surcharge for MRO parts', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Place emergency order for spare part', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-7001');
      await page.locator('[data-testid="order-priority"]').selectOption('emergency');
      await page.locator('[data-testid="calculate-btn"]').click();
    });

    await test.step('Verify emergency surcharge is added', async () => {
      const surcharge = page.locator('[data-testid="emergency-surcharge"]');
      await expect(surcharge).toBeVisible();
    });
  });

  test('TC-MR-004: Reject order for discontinued part without supersession', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Search for discontinued part with no replacement', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-DISCONTINUED');
    });

    await test.step('Verify discontinued error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Part discontinued');
    });
  });
});
