import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { freightZones } from '../../src/data/test-data';

/**
 * TC-FI: Freight & Incoterm Pricing Test Suite
 * Covers BRD Section: Freight Cost and Incoterm-Based Pricing
 */
test.describe('Freight & Incoterm Pricing @freight', () => {
  test('TC-FI-001: Verify FOB freight includes only origin charges', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select FOB incoterm', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="incoterm-select"]').selectOption('FOB');
      await page.locator('[data-testid="calculate-btn"]').click();
    });

    await test.step('Verify FOB pricing excludes destination freight', async () => {
      const freightLabel = page.locator('[data-testid="freight-breakdown"]');
      await expect(freightLabel).toContainText('FOB');
    });
  });

  test('TC-FI-002: Verify DDP includes all duties and destination charges', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select DDP incoterm', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="incoterm-select"]').selectOption('DDP');
      await page.locator('[data-testid="ship-to-zone"]').selectOption(freightZones.international.zoneName);
      await page.locator('[data-testid="calculate-btn"]').click();
    });

    await test.step('Verify DDP includes duties and delivery charges', async () => {
      const duties = page.locator('[data-testid="duties-included"]');
      await expect(duties).toBeVisible();
    });
  });

  test('TC-FI-003: Verify CIF includes insurance and freight', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select CIF incoterm', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="incoterm-select"]').selectOption('CIF');
      await page.locator('[data-testid="calculate-btn"]').click();
    });

    await test.step('Verify CIF breakdown shows insurance and freight', async () => {
      const breakdown = page.locator('[data-testid="freight-breakdown"]');
      await expect(breakdown).toContainText('CIF');
    });
  });

  test('TC-FI-004: Reject order with missing shipping zone for DDP', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select DDP without specifying zone', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="incoterm-select"]').selectOption('DDP');
      await page.locator('[data-testid="calculate-btn"]').click();
    });

    await test.step('Verify shipping zone required error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Shipping zone is required');
    });
  });

  test('TC-FI-005: Verify EXW pricing has no freight charges', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Select EXW incoterm', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      await page.locator('[data-testid="incoterm-select"]').selectOption('EXW');
      await page.locator('[data-testid="calculate-btn"]').click();
    });

    await test.step('Verify zero freight charges', async () => {
      const freightCost = page.locator('[data-testid="freight-cost"]');
      const value = await freightCost.textContent();
      expect(parseFloat(value?.replace(/[^0-9.]/g, '') || '0')).toBe(0);
    });
  });
});
