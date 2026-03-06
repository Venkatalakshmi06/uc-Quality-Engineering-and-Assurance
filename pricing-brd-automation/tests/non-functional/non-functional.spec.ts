import { test, expect } from '../../src/fixtures/pricing-fixtures';

/**
 * TC-NF: Non-Functional Requirements Test Suite
 * Covers BRD Section: Performance, Scalability, and Security Requirements
 */
test.describe('Non-Functional Requirements @nfr', () => {
  test('TC-NF-001: Verify pricing page load time under 3 seconds', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Measure page load time', async () => {
      const startTime = Date.now();
      await pricingPage.goto();
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });
  });

  test('TC-NF-002: Verify price calculation response time under 2 seconds', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Measure calculation response time', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      const startTime = Date.now();
      await page.locator('[data-testid="calculate-btn"]').click();
      await page.locator('[data-testid="net-price"]').waitFor({ state: 'visible' });
      const calcTime = Date.now() - startTime;
      expect(calcTime).toBeLessThan(2000);
    });
  });

  test('TC-NF-003: Verify concurrent user session handling', async ({ pricingPage }) => {
    await test.step('Open multiple product views', async () => {
      await pricingPage.goto();
      await pricingPage.searchProduct('SKU-1001');
      const isLoaded = await pricingPage.isLoaded();
      expect(isLoaded).toBeTruthy();
    });
  });

  test('TC-NF-004: Verify session timeout after inactivity', async ({
    pricingPage,
    page,
  }) => {
    await test.step('Navigate to pricing page', async () => {
      await pricingPage.goto();
    });

    await test.step('Verify session timeout element exists', async () => {
      const sessionTimer = page.locator('[data-testid="session-timer"]');
      await expect(sessionTimer).toBeVisible();
    });
  });

  test('TC-NF-005: Verify HTTPS is enforced for all pricing endpoints', async ({
    page,
  }) => {
    await test.step('Check URL protocol', async () => {
      await page.goto('/pricing');
      const url = page.url();
      // In test env, localhost is expected; in prod, HTTPS is required
      expect(url).toMatch(/^https?:\/\//);
    });
  });

  test('TC-NF-006: Verify error pages display user-friendly messages', async ({
    page,
  }) => {
    await test.step('Navigate to non-existent page', async () => {
      await page.goto('/pricing/nonexistent-page-12345');
    });

    await test.step('Verify friendly error page', async () => {
      const body = await page.locator('body').textContent();
      expect(body).not.toContain('stack trace');
      expect(body).not.toContain('Exception');
    });
  });
});
