import { test, expect } from '../../src/fixtures/pricing-fixtures';
import { quoteRequests } from '../../src/data/test-data';

/**
 * TC-DP: Deal Pricing / Override Test Suite
 * Covers BRD Section: Deal Desk Override and Approval Workflow
 */
test.describe('Deal Pricing / Override @deal', () => {
  test('TC-DP-001: Verify standard deal request within approval threshold', async ({
    approvalWorkflowPage,
    page,
  }) => {
    await test.step('Submit deal pricing request', async () => {
      await approvalWorkflowPage.goto();
      await page.locator('[data-testid="new-request-btn"]').click();
      await page.locator('[data-testid="request-type"]').selectOption('discount_override');
      await page.locator('[data-testid="customer-id"]').fill(quoteRequests.standardDeal.customerId);
      await page.locator('[data-testid="discount-percent"]').fill('8');
      await approvalWorkflowPage.submitApprovalRequest(quoteRequests.standardDeal.rationale || '');
    });

    await test.step('Verify deal is within sales rep approval threshold', async () => {
      const status = page.locator('[data-testid="request-status"]');
      await expect(status).toBeVisible();
    });
  });

  test('TC-DP-002: Verify aggressive deal triggers escalation', async ({
    approvalWorkflowPage,
    page,
  }) => {
    await test.step('Submit aggressive discount request (40%)', async () => {
      await approvalWorkflowPage.goto();
      await page.locator('[data-testid="new-request-btn"]').click();
      await page.locator('[data-testid="request-type"]').selectOption('discount_override');
      await page.locator('[data-testid="customer-id"]').fill(quoteRequests.aggressiveDeal.customerId);
      await page.locator('[data-testid="discount-percent"]').fill('40');
      await approvalWorkflowPage.submitApprovalRequest(quoteRequests.aggressiveDeal.rationale || '');
    });

    await test.step('Verify escalation to higher authority', async () => {
      const escalation = page.locator('[data-testid="escalation-notice"]');
      await expect(escalation).toContainText('escalated');
    });
  });

  test('TC-DP-003: Verify deal override with RBAC enforcement', async ({
    approvalWorkflowPage,
    page,
  }) => {
    await test.step('Attempt override as sales rep (limited authority)', async () => {
      await approvalWorkflowPage.goto();
      await page.locator('[data-testid="new-request-btn"]').click();
      await page.locator('[data-testid="request-type"]').selectOption('discount_override');
      await page.locator('[data-testid="discount-percent"]').fill('25');
      await approvalWorkflowPage.submitApprovalRequest('Competitive match');
    });

    await test.step('Verify RBAC blocks direct approval', async () => {
      const status = page.locator('[data-testid="request-status"]');
      await expect(status).toContainText('Pending');
    });
  });

  test('TC-DP-004: Reject deal override without rationale', async ({
    approvalWorkflowPage,
    page,
  }) => {
    await test.step('Submit deal without business justification', async () => {
      await approvalWorkflowPage.goto();
      await page.locator('[data-testid="new-request-btn"]').click();
      await page.locator('[data-testid="request-type"]').selectOption('discount_override');
      await page.locator('[data-testid="discount-percent"]').fill('15');
      await approvalWorkflowPage.submitApprovalRequest('');
    });

    await test.step('Verify rationale required error', async () => {
      const error = page.locator('[data-testid="error-message"]');
      await expect(error).toContainText('Rationale is required');
    });
  });
});
