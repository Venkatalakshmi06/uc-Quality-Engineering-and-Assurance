import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * PricingModulePage - Page object for the main pricing module.
 * Handles navigation and interactions with the pricing dashboard.
 */
export class PricingModulePage extends BasePage {
  // Navigation elements
  readonly pricingNav: Locator;
  readonly dashboardLink: Locator;
  readonly priceBookLink: Locator;
  readonly adjustmentsLink: Locator;
  readonly contractsLink: Locator;
  readonly reportsLink: Locator;

  // Dashboard elements
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productTable: Locator;
  readonly priceCalculationPanel: Locator;

  // Price display elements
  readonly listPriceField: Locator;
  readonly netPriceField: Locator;
  readonly marginField: Locator;
  readonly currencySelector: Locator;

  constructor(page: Page) {
    super(page);
    this.pricingNav = page.locator('[data-testid="pricing-nav"]');
    this.dashboardLink = page.locator('[data-testid="dashboard-link"]');
    this.priceBookLink = page.locator('[data-testid="pricebook-link"]');
    this.adjustmentsLink = page.locator('[data-testid="adjustments-link"]');
    this.contractsLink = page.locator('[data-testid="contracts-link"]');
    this.reportsLink = page.locator('[data-testid="reports-link"]');
    this.searchInput = page.locator('[data-testid="product-search"]');
    this.searchButton = page.locator('[data-testid="search-button"]');
    this.productTable = page.locator('[data-testid="product-table"]');
    this.priceCalculationPanel = page.locator('[data-testid="price-calc-panel"]');
    this.listPriceField = page.locator('[data-testid="list-price"]');
    this.netPriceField = page.locator('[data-testid="net-price"]');
    this.marginField = page.locator('[data-testid="margin"]');
    this.currencySelector = page.locator('[data-testid="currency-select"]');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/pricing');
  }

  async isLoaded(): Promise<boolean> {
    return this.pricingNav.isVisible();
  }

  /** Search for a product by SKU */
  async searchProduct(sku: string): Promise<void> {
    await this.fill(this.searchInput, sku);
    await this.click(this.searchButton);
    await this.waitForLoadingComplete();
  }

  /** Navigate to price book management */
  async openPriceBooks(): Promise<void> {
    await this.click(this.priceBookLink);
    await this.waitForLoadingComplete();
  }

  /** Navigate to adjustments management */
  async openAdjustments(): Promise<void> {
    await this.click(this.adjustmentsLink);
    await this.waitForLoadingComplete();
  }

  /** Navigate to contracts management */
  async openContracts(): Promise<void> {
    await this.click(this.contractsLink);
    await this.waitForLoadingComplete();
  }

  /** Get the displayed list price */
  async getListPrice(): Promise<string> {
    return this.getText(this.listPriceField);
  }

  /** Get the displayed net price */
  async getNetPrice(): Promise<string> {
    return this.getText(this.netPriceField);
  }

  /** Get the displayed margin */
  async getMargin(): Promise<string> {
    return this.getText(this.marginField);
  }

  /** Select a currency */
  async selectCurrency(currency: string): Promise<void> {
    await this.selectOption(this.currencySelector, currency);
    await this.waitForLoadingComplete();
  }
}
