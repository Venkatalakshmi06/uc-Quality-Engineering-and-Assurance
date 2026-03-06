import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * CostPlusPage - Page object for Cost-Plus Pricing configuration and calculation.
 */
export class CostPlusPage extends BasePage {
  readonly costInput: Locator;
  readonly markupInput: Locator;
  readonly freightAdder: Locator;
  readonly dutiesAdder: Locator;
  readonly overheadAdder: Locator;
  readonly calculateButton: Locator;
  readonly resultPrice: Locator;
  readonly saveButton: Locator;
  readonly errorMessage: Locator;
  readonly skuSelector: Locator;

  constructor(page: Page) {
    super(page);
    this.costInput = page.locator('[data-testid="cost-input"]');
    this.markupInput = page.locator('[data-testid="markup-input"]');
    this.freightAdder = page.locator('[data-testid="freight-adder"]');
    this.dutiesAdder = page.locator('[data-testid="duties-adder"]');
    this.overheadAdder = page.locator('[data-testid="overhead-adder"]');
    this.calculateButton = page.locator('[data-testid="calculate-btn"]');
    this.resultPrice = page.locator('[data-testid="result-price"]');
    this.saveButton = page.locator('[data-testid="save-btn"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.skuSelector = page.locator('[data-testid="sku-select"]');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/pricing/cost-plus');
  }

  async isLoaded(): Promise<boolean> {
    return this.costInput.isVisible();
  }

  /** Configure cost-plus pricing parameters */
  async configureCostPlus(
    cost: string,
    markup: string,
    freight: string,
    duties: string,
    overhead: string,
  ): Promise<void> {
    await this.fill(this.costInput, cost);
    await this.fill(this.markupInput, markup);
    await this.fill(this.freightAdder, freight);
    await this.fill(this.dutiesAdder, duties);
    await this.fill(this.overheadAdder, overhead);
  }

  /** Click calculate and get result */
  async calculatePrice(): Promise<string> {
    await this.click(this.calculateButton);
    await this.waitForLoadingComplete();
    return this.getText(this.resultPrice);
  }

  /** Save the pricing configuration */
  async savePricing(): Promise<void> {
    await this.click(this.saveButton);
    await this.waitForLoadingComplete();
  }

  /** Get displayed error message */
  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }
}
