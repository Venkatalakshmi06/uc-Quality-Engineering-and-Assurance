import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * ContractPricingPage - Page object for Contract Pricing management.
 */
export class ContractPricingPage extends BasePage {
  readonly contractIdInput: Locator;
  readonly customerSelector: Locator;
  readonly effectiveFromInput: Locator;
  readonly effectiveToInput: Locator;
  readonly protectionWindowInput: Locator;
  readonly escalatorInput: Locator;
  readonly itemsTable: Locator;
  readonly addItemButton: Locator;
  readonly saveContractButton: Locator;
  readonly statusLabel: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.contractIdInput = page.locator('[data-testid="contract-id"]');
    this.customerSelector = page.locator('[data-testid="customer-select"]');
    this.effectiveFromInput = page.locator('[data-testid="effective-from"]');
    this.effectiveToInput = page.locator('[data-testid="effective-to"]');
    this.protectionWindowInput = page.locator('[data-testid="protection-window"]');
    this.escalatorInput = page.locator('[data-testid="escalator-input"]');
    this.itemsTable = page.locator('[data-testid="contract-items-table"]');
    this.addItemButton = page.locator('[data-testid="add-item-btn"]');
    this.saveContractButton = page.locator('[data-testid="save-contract-btn"]');
    this.statusLabel = page.locator('[data-testid="contract-status"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/pricing/contracts');
  }

  async isLoaded(): Promise<boolean> {
    return this.contractIdInput.isVisible();
  }

  /** Create a new contract */
  async createContract(
    customerId: string,
    effectiveFrom: string,
    effectiveTo: string,
    protectionDays: string,
    escalator?: string,
  ): Promise<void> {
    await this.selectOption(this.customerSelector, customerId);
    await this.fill(this.effectiveFromInput, effectiveFrom);
    await this.fill(this.effectiveToInput, effectiveTo);
    await this.fill(this.protectionWindowInput, protectionDays);
    if (escalator) {
      await this.fill(this.escalatorInput, escalator);
    }
  }

  /** Add a line item to the contract */
  async addContractItem(sku: string, contractPrice: string): Promise<void> {
    await this.click(this.addItemButton);
    const lastRow = this.itemsTable.locator('tr:last-child');
    await this.fill(lastRow.locator('[data-testid="item-sku"]'), sku);
    await this.fill(lastRow.locator('[data-testid="item-price"]'), contractPrice);
  }

  /** Save the contract */
  async saveContract(): Promise<void> {
    await this.click(this.saveContractButton);
    await this.waitForLoadingComplete();
  }

  /** Get contract status */
  async getStatus(): Promise<string> {
    return this.getText(this.statusLabel);
  }
}
