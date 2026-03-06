import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * TieredPricingPage - Page object for Volume/Tiered Pricing configuration.
 */
export class TieredPricingPage extends BasePage {
  readonly skuInput: Locator;
  readonly tierTable: Locator;
  readonly addTierButton: Locator;
  readonly quantityInput: Locator;
  readonly simulateButton: Locator;
  readonly resultPrice: Locator;
  readonly tierAppliedLabel: Locator;
  readonly saveTiersButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.skuInput = page.locator('[data-testid="sku-input"]');
    this.tierTable = page.locator('[data-testid="tier-table"]');
    this.addTierButton = page.locator('[data-testid="add-tier-btn"]');
    this.quantityInput = page.locator('[data-testid="quantity-input"]');
    this.simulateButton = page.locator('[data-testid="simulate-btn"]');
    this.resultPrice = page.locator('[data-testid="result-price"]');
    this.tierAppliedLabel = page.locator('[data-testid="tier-applied"]');
    this.saveTiersButton = page.locator('[data-testid="save-tiers-btn"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/pricing/tiered');
  }

  async isLoaded(): Promise<boolean> {
    return this.tierTable.isVisible();
  }

  /** Set tier configuration row */
  async setTier(
    rowIndex: number,
    minQty: string,
    maxQty: string,
    unitPrice: string,
  ): Promise<void> {
    const row = this.tierTable.locator(`tr:nth-child(${rowIndex})`);
    await this.fill(row.locator('[data-testid="min-qty"]'), minQty);
    await this.fill(row.locator('[data-testid="max-qty"]'), maxQty);
    await this.fill(row.locator('[data-testid="unit-price"]'), unitPrice);
  }

  /** Simulate price for a given quantity */
  async simulateQuantity(quantity: string): Promise<string> {
    await this.fill(this.quantityInput, quantity);
    await this.click(this.simulateButton);
    await this.waitForLoadingComplete();
    return this.getText(this.resultPrice);
  }

  /** Get applied tier label */
  async getAppliedTier(): Promise<string> {
    return this.getText(this.tierAppliedLabel);
  }

  /** Save tier configuration */
  async saveTiers(): Promise<void> {
    await this.click(this.saveTiersButton);
    await this.waitForLoadingComplete();
  }
}
