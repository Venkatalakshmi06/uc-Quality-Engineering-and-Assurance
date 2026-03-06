import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * ApprovalWorkflowPage - Page object for pricing approval workflows.
 * Handles NPI pricing, price changes, deal overrides, and bulk updates.
 */
export class ApprovalWorkflowPage extends BasePage {
  readonly pendingApprovalsTable: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly escalateButton: Locator;
  readonly rationaleInput: Locator;
  readonly submitButton: Locator;
  readonly statusFilter: Locator;
  readonly typeFilter: Locator;
  readonly approvalHistory: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pendingApprovalsTable = page.locator('[data-testid="approvals-table"]');
    this.approveButton = page.locator('[data-testid="approve-btn"]');
    this.rejectButton = page.locator('[data-testid="reject-btn"]');
    this.escalateButton = page.locator('[data-testid="escalate-btn"]');
    this.rationaleInput = page.locator('[data-testid="rationale-input"]');
    this.submitButton = page.locator('[data-testid="submit-btn"]');
    this.statusFilter = page.locator('[data-testid="status-filter"]');
    this.typeFilter = page.locator('[data-testid="type-filter"]');
    this.approvalHistory = page.locator('[data-testid="approval-history"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/pricing/approvals');
  }

  async isLoaded(): Promise<boolean> {
    return this.pendingApprovalsTable.isVisible();
  }

  /** Submit a new approval request */
  async submitApprovalRequest(rationale: string): Promise<void> {
    await this.fill(this.rationaleInput, rationale);
    await this.click(this.submitButton);
    await this.waitForLoadingComplete();
  }

  /** Approve a pending request by row index */
  async approveRequest(rowIndex: number): Promise<void> {
    const row = this.pendingApprovalsTable.locator(`tbody tr:nth-child(${rowIndex})`);
    await this.click(row.locator('[data-testid="approve-btn"]'));
    await this.waitForLoadingComplete();
  }

  /** Reject a pending request by row index */
  async rejectRequest(rowIndex: number, reason: string): Promise<void> {
    const row = this.pendingApprovalsTable.locator(`tbody tr:nth-child(${rowIndex})`);
    await this.click(row.locator('[data-testid="reject-btn"]'));
    await this.fill(this.rationaleInput, reason);
    await this.click(this.submitButton);
    await this.waitForLoadingComplete();
  }

  /** Escalate a request */
  async escalateRequest(rowIndex: number): Promise<void> {
    const row = this.pendingApprovalsTable.locator(`tbody tr:nth-child(${rowIndex})`);
    await this.click(row.locator('[data-testid="escalate-btn"]'));
    await this.waitForLoadingComplete();
  }

  /** Filter by status */
  async filterByStatus(status: string): Promise<void> {
    await this.selectOption(this.statusFilter, status);
    await this.waitForLoadingComplete();
  }

  /** Get count of pending approvals */
  async getPendingCount(): Promise<number> {
    return this.pendingApprovalsTable.locator('tbody tr').count();
  }
}
