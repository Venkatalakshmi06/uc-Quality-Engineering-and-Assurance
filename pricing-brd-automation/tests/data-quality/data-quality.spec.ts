import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { invalidData } from '../../src/data/test-data';

/**
 * TC-DQ: Data Quality Test Suite
 * Covers BRD Section: Data Quality Rules and Validation
 */
test.describe('Data Quality @data-quality', () => {
  test('TC-DQ-001: Verify mandatory fields are enforced on price entry', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Attempt to save with all mandatory fields empty', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="new-price-entry-btn"]').click();
      await page.locator('[data-testid="save-btn"]').click();
    });

    await test.step('Verify validation errors for each mandatory field', async () => {
      const errors = page.locator('.field-error');
      const count = await errors.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test('TC-DQ-002: Verify duplicate SKU-PriceBook combination is rejected', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Attempt to create duplicate price entry', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="new-price-entry-btn"]').click();
      await page.locator('[data-testid="sku-input"]').fill('SKU-1001');
      await page.locator('[data-testid="pricebook-select"]').selectOption('PB-001');
      await page.locator('[data-testid="price-input"]').fill('150');
      await page.locator('[data-testid="save-btn"]').click();
    });

    await test.step('Verify duplicate rejection', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('already exists');
    });
  });

  test('TC-DQ-003: Verify non-numeric price value is rejected', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Enter text in price field', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="new-price-entry-btn"]').click();
      await page.locator('[data-testid="price-input"]').fill('not-a-number');
      await page.locator('[data-testid="save-btn"]').click();
    });

    await test.step('Verify type validation error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('valid number');
    });
  });

  test('TC-DQ-004: Verify currency code validation (ISO 4217)', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Enter invalid currency code', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="new-price-entry-btn"]').click();
      await page.locator('[data-testid="currency-input"]').fill(invalidData.invalidCurrency);
      await page.locator('[data-testid="save-btn"]').click();
    });

    await test.step('Verify invalid currency error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Invalid currency');
    });
  });

  test('TC-DQ-005: Verify date format validation', async ({ pricingPage, page }) => {
    await test.step('Enter invalid date format', async () => {
      await pricingPage.goto();
      await page.locator('[data-testid="new-price-entry-btn"]').click();
      await page.locator('[data-testid="effective-date"]').fill('31/13/2026');
      await page.locator('[data-testid="save-btn"]').click();
    });

    await test.step('Verify date format error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Invalid date');
    });
  });
});
