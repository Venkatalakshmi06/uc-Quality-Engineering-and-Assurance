import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { PriceCalculator } from '../../src/utils/price-calculator';
import { products, regulatoryLimits } from '../../src/data/test-data';

/**
 * TC-RG: Regulated Goods Pricing Test Suite
 * Covers BRD Section: Regulatory Price Caps and Floors
 * Validates price ceiling/floor enforcement and compliance flagging.
 */
test.describe('Regulated Goods Pricing @regulated', () => {
  test('TC-RG-001: Verify price within regulatory ceiling and floor is accepted', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Set price within regulated bounds', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.regulated.sku);
      await page.locator('[data-testid="manual-price"]').fill('300');
      await page.locator('[data-testid="validate-price-btn"]').click();
    });

    await test.step('Verify compliance check passes', async () => {
      const result = PriceCalculator.validateRegulatoryLimits(
        300, regulatoryLimits.medicalTubing.priceCap, regulatoryLimits.medicalTubing.priceFloor,
      );
      expect(result.valid).toBe(true);
      const status = page.locator('[data-testid="compliance-status"]');
      await expect(status).toContainText('Compliant');
    });
  });

  test('TC-RG-002: Block price exceeding regulatory ceiling', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Set price above regulatory cap ($500)', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.regulated.sku);
      await page.locator('[data-testid="manual-price"]').fill('550');
      await page.locator('[data-testid="validate-price-btn"]').click();
    });

    await test.step('Verify regulatory violation is flagged', async () => {
      const error = page.locator('[data-testid="compliance-error"]');
      await expect(error).toContainText('exceeds regulatory cap');
    });
  });

  test('TC-RG-003: Block price below regulatory floor', async ({ pricingPage, page }) => {
    await test.step('Set price below regulatory floor ($50)', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.regulated.sku);
      await page.locator('[data-testid="manual-price"]').fill('40');
      await page.locator('[data-testid="validate-price-btn"]').click();
    });

    await test.step('Verify floor violation is flagged', async () => {
      const error = page.locator('[data-testid="compliance-error"]');
      await expect(error).toContainText('below regulatory floor');
    });
  });

  test('TC-RG-004: Verify price at exact regulatory ceiling boundary', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Set price at exactly $500 (ceiling)', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.regulated.sku);
      await page.locator('[data-testid="manual-price"]').fill('500');
      await page.locator('[data-testid="validate-price-btn"]').click();
    });

    await test.step('Verify exact ceiling is accepted', async () => {
      const status = page.locator('[data-testid="compliance-status"]');
      await expect(status).toContainText('Compliant');
    });
  });

  test('TC-RG-005: Verify regulated product requires justification for price change', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Change regulated product price without justification', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct(products.regulated.sku);
      await page.locator('[data-testid="manual-price"]').fill('350');
      await page.locator('[data-testid="save-price-btn"]').click();
    });

    await test.step('Verify justification is required', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Justification required');
    });
  });
});
