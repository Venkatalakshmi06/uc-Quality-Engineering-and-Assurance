import { type Page, type Locator, expect } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly productGrid: Locator;
  readonly productCount: Locator;
  readonly pageTitle: Locator;
  readonly noResults: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.categoryFilter = page.locator('[data-testid="category-filter"]');
    this.productGrid = page.locator('[data-testid="product-grid"]');
    this.productCount = page.locator('[data-testid="product-count"]');
    this.pageTitle = page.locator('[data-testid="page-title"]');
    this.noResults = page.locator('[data-testid="no-results"]');
  }

  async goto() {
    await this.page.goto("/");
    await this.pageTitle.waitFor({ state: "visible" });
  }

  async searchProduct(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.searchInput.fill("");
  }

  async selectCategory(category: string) {
    await this.categoryFilter.selectOption(category);
  }

  async getProductCount(): Promise<number> {
    const text = await this.productCount.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  getProductCard(productId: number): Locator {
    return this.page.locator(`[data-testid="product-card-${productId}"]`);
  }

  getProductLink(productId: number): Locator {
    return this.page.locator(`[data-testid="product-link-${productId}"]`);
  }

  getAddToCartButton(productId: number): Locator {
    return this.page.locator(`[data-testid="add-to-cart-${productId}"]`);
  }

  async addProductToCart(productId: number) {
    await this.getAddToCartButton(productId).click();
  }

  async clickProduct(productId: number) {
    await this.getProductLink(productId).click();
  }

  async verifyProductVisible(productId: number) {
    await expect(this.getProductCard(productId)).toBeVisible();
  }

  async verifyProductNotVisible(productId: number) {
    await expect(this.getProductCard(productId)).not.toBeVisible();
  }
}
