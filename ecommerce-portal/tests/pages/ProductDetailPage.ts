import { type Page, type Locator, expect } from "@playwright/test";

export class ProductDetailPage {
  readonly page: Page;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly productCategory: Locator;
  readonly productImage: Locator;
  readonly productStock: Locator;
  readonly addToCartButton: Locator;
  readonly buyNowButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productName = page.locator('[data-testid="product-detail-name"]');
    this.productPrice = page.locator('[data-testid="product-detail-price"]');
    this.productDescription = page.locator('[data-testid="product-detail-description"]');
    this.productCategory = page.locator('[data-testid="product-detail-category"]');
    this.productImage = page.locator('[data-testid="product-detail-image"]');
    this.productStock = page.locator('[data-testid="product-detail-stock"]');
    this.addToCartButton = page.locator('[data-testid="product-detail-add-to-cart"]');
    this.buyNowButton = page.locator('[data-testid="product-detail-buy-now"]');
    this.backButton = page.locator('[data-testid="back-button"]');
  }

  async goto(productId: number) {
    await this.page.goto(`/product/${productId}`);
    await this.productName.waitFor({ state: "visible" });
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async buyNow() {
    await this.buyNowButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async verifyProductDetails(expected: {
    name?: string;
    price?: string;
    category?: string;
    inStock?: boolean;
  }) {
    if (expected.name) {
      await expect(this.productName).toContainText(expected.name);
    }
    if (expected.price) {
      await expect(this.productPrice).toContainText(expected.price);
    }
    if (expected.category) {
      await expect(this.productCategory).toContainText(expected.category);
    }
    if (expected.inStock !== undefined) {
      const stockText = expected.inStock ? "In Stock" : "Out of Stock";
      await expect(this.productStock).toContainText(stockText);
    }
  }
}
