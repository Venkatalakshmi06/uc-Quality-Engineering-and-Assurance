import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { invalidData } from '../../src/data/test-data';

/**
 * TC-BR: Business Rules Test Suite
 * Covers BRD Section: Business Rules and Validation
 */
test.describe('Business Rules @business-rules', () => {
  test('TC-BR-001: Verify price cannot be set to zero', async ({ pricingPage, page }) => {
    await test.step('Attempt to set price to $0', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="manual-price"]').fill('0');
      await page.locator('[data-testid="save-price-btn"]').click();
    });

    await test.step('Verify zero price rejection', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Price must be greater than zero');
    });
  });

  test('TC-BR-002: Verify price cannot be negative', async ({ pricingPage, page }) => {
    await test.step('Attempt to set negative price', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="manual-price"]').fill('-50');
      await page.locator('[data-testid="save-price-btn"]').click();
    });

    await test.step('Verify negative price rejection', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Price cannot be negative');
    });
  });

  test('TC-BR-003: Verify effective dates are required for price entries', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Attempt to save price without effective date', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="manual-price"]').fill('150');
      await page.locator('[data-testid="effective-date"]').fill('');
      await page.locator('[data-testid="save-price-btn"]').click();
    });

    await test.step('Verify effective date required error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Effective date is required');
    });
  });

  test('TC-BR-004: Verify XSS input is sanitized', async ({ pricingPage, page }) => {
    await test.step('Enter XSS script in SKU field', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(invalidData.specialChars);
    });

    await test.step('Verify input is sanitized and no script execution', async () => {
      const searchField = page.locator('[data-testid="product-search"]');
      const value = await searchField.inputValue();
      expect(value).not.toContain('<script>');
    });
  });

  test('TC-BR-005: Verify SQL injection is prevented', async ({ pricingPage, page }) => {
    await test.step('Enter SQL injection in search', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(invalidData.sqlInjection);
    });

    await test.step('Verify no database error exposed', async () => {
      const errorMsg = page.locator('[data-testid="error-message"]');
      const text = await errorMsg.textContent();
      expect(text).not.toContain('SQL');
      expect(text).not.toContain('syntax');
    });
  });

  test('TC-BR-006: Verify maximum field length enforcement', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Enter excessively long input', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(invalidData.longString);
    });

    await test.step('Verify input is truncated or error shown', async () => {
      const searchField = page.locator('[data-testid="product-search"]');
      const value = await searchField.inputValue();
      expect(value.length).toBeLessThanOrEqual(10001);
    });
  });
});
