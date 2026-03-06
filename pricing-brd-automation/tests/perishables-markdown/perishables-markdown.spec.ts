import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { products } from '../../src/data/test-data';

/**
 * TC-PM: Perishables Markdown Test Suite
 * Covers BRD Section: Shelf-Life Based Markdown for Perishable Products
 * Validates automatic markdown based on remaining shelf-life percentage.
 */
test.describe('Perishables Markdown @perishables', () => {
  test('TC-PM-001: Verify markdown at 50-75% remaining shelf life (10% off)', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select perishable product with 60% shelf life remaining', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.perishable.sku);
    });

    await test.step('Verify 10% markdown is applied', async () => {
      const markdown = page.locator('[data-testid="markdown-percent"]');
      await expect(markdown).toContainText('10%');
    });
  });

  test('TC-PM-002: Verify markdown at 25-49% remaining shelf life (25% off)', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select product with 35% remaining shelf life', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.perishable.sku);
      await page.locator('[data-testid="remaining-shelf-life"]').fill('35');
      await page.locator('[data-testid="recalculate-btn"]').click();
    });

    await test.step('Verify 25% markdown applied', async () => {
      const markdown = page.locator('[data-testid="markdown-percent"]');
      await expect(markdown).toContainText('25%');
    });
  });

  test('TC-PM-003: Verify markdown at 10-24% remaining shelf life (50% off)', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Set 15% remaining shelf life', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.perishable.sku);
      await page.locator('[data-testid="remaining-shelf-life"]').fill('15');
      await page.locator('[data-testid="recalculate-btn"]').click();
    });

    await test.step('Verify 50% markdown applied', async () => {
      const markdown = page.locator('[data-testid="markdown-percent"]');
      await expect(markdown).toContainText('50%');
    });
  });

  test('TC-PM-004: Verify markdown at <10% remaining shelf life (75% off)', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Set 5% remaining shelf life', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.perishable.sku);
      await page.locator('[data-testid="remaining-shelf-life"]').fill('5');
      await page.locator('[data-testid="recalculate-btn"]').click();
    });

    await test.step('Verify 75% markdown applied', async () => {
      const markdown = page.locator('[data-testid="markdown-percent"]');
      await expect(markdown).toContainText('75%');
    });
  });

  test('TC-PM-005: Reject markdown on non-perishable product', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Attempt shelf-life markdown on standard product', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="apply-markdown-btn"]').click();
    });

    await test.step('Verify markdown not applicable error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('not a perishable product');
    });
  });

  test('TC-PM-006: Verify no markdown at >75% remaining shelf life', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Set 80% remaining shelf life', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.perishable.sku);
      await page.locator('[data-testid="remaining-shelf-life"]').fill('80');
      await page.locator('[data-testid="recalculate-btn"]').click();
    });

    await test.step('Verify no markdown applied', async () => {
      const markdown = page.locator('[data-testid="markdown-percent"]');
      await expect(markdown).toContainText('0%');
    });
  });
});
