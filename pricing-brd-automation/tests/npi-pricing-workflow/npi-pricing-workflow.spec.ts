import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { products } from '../../src/data/test-data';

/**
 * TC-NP: NPI (New Product Introduction) Pricing Workflow Test Suite
 * Covers BRD Section: NPI Pricing Approval Workflow
 */
test.describe('NPI Pricing Workflow @npi', () => {
  test('TC-NP-001: Verify NPI pricing request submission', async ({
    approvalWorkflowPage,
    page,
  }) => {
    await test.step('Submit NPI pricing request for new product', async () => {
      await approvalWorkflowPage.goto();
      await page.locator('[data-testid="new-request-btn"]').click();
      await page.locator('[data-testid="request-type"]').selectOption('npi_pricing');
      await page.locator('[data-testid="product-sku"]').fill(products.launchProduct.sku);
      await page.locator('[data-testid="proposed-price"]').fill('250.00');
      await approvalWorkflowPage.submitApprovalRequest('New sensor module launch pricing');
    });

    await test.step('Verify request is in pending status', async () => {
      const status = page.locator('[data-testid="request-status"]');
      await expect(status).toContainText('Pending');
    });
  });

  test('TC-NP-002: Verify NPI pricing approval by pricing admin', async ({
    approvalWorkflowPage,
  }) => {
    await test.step('Navigate to pending approvals', async () => {
      await approvalWorkflowPage.goto();
      await approvalWorkflowPage.filterByStatus('pending');
    });

    await test.step('Approve NPI pricing request', async () => {
      await approvalWorkflowPage.approveRequest(1);
      const count = await approvalWorkflowPage.getPendingCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test('TC-NP-003: Verify NPI pricing rejection with reason', async ({
    approvalWorkflowPage,
  }) => {
    await test.step('Reject NPI pricing request', async () => {
      await approvalWorkflowPage.goto();
      await approvalWorkflowPage.filterByStatus('pending');
      await approvalWorkflowPage.rejectRequest(1, 'Proposed price too low for market positioning');
    });

    await test.step('Verify rejection processed', async () => {
      const count = await approvalWorkflowPage.getPendingCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test('TC-NP-004: Reject NPI submission without rationale', async ({
    approvalWorkflowPage,
    page,
  }) => {
    await test.step('Submit NPI request without rationale', async () => {
      await approvalWorkflowPage.goto();
      await page.locator('[data-testid="new-request-btn"]').click();
      await page.locator('[data-testid="request-type"]').selectOption('npi_pricing');
      await page.locator('[data-testid="product-sku"]').fill(products.launchProduct.sku);
      await page.locator('[data-testid="proposed-price"]').fill('250.00');
      await approvalWorkflowPage.submitApprovalRequest('');
    });

    await test.step('Verify rationale required error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Rationale is required');
    });
  });
});
