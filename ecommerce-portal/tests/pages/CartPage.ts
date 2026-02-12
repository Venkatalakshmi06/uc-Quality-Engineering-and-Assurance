import { type Page, type Locator, expect } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly cartTitle: Locator;
  readonly emptyCart: Locator;
  readonly cartSubtotal: Locator;
  readonly cartTotal: Locator;
  readonly clearCartButton: Locator;
  readonly proceedToCheckout: Locator;
  readonly continueShopping: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartTitle = page.locator('[data-testid="cart-title"]');
    this.emptyCart = page.locator('[data-testid="empty-cart"]');
    this.cartSubtotal = page.locator('[data-testid="cart-subtotal"]');
    this.cartTotal = page.locator('[data-testid="cart-total"]');
    this.clearCartButton = page.locator('[data-testid="clear-cart"]');
    this.proceedToCheckout = page.locator('[data-testid="proceed-to-checkout"]');
    this.continueShopping = page.locator('[data-testid="continue-shopping"]');
  }

  async goto() {
    await this.page.goto("/cart");
    await this.cartTitle.waitFor({ state: "visible" });
  }

  getCartItem(productId: number): Locator {
    return this.page.locator(`[data-testid="cart-item-${productId}"]`);
  }

  getCartItemName(productId: number): Locator {
    return this.page.locator(`[data-testid="cart-item-name-${productId}"]`);
  }

  getItemQuantity(productId: number): Locator {
    return this.page.locator(`[data-testid="item-quantity-${productId}"]`);
  }

  getIncreaseButton(productId: number): Locator {
    return this.page.locator(`[data-testid="increase-qty-${productId}"]`);
  }

  getDecreaseButton(productId: number): Locator {
    return this.page.locator(`[data-testid="decrease-qty-${productId}"]`);
  }

  getRemoveButton(productId: number): Locator {
    return this.page.locator(`[data-testid="remove-item-${productId}"]`);
  }

  async increaseQuantity(productId: number) {
    await this.getIncreaseButton(productId).click();
  }

  async decreaseQuantity(productId: number) {
    await this.getDecreaseButton(productId).click();
  }

  async removeItem(productId: number) {
    await this.getRemoveButton(productId).click();
  }

  async clearCart() {
    await this.clearCartButton.click();
  }

  async proceedCheckout() {
    await this.proceedToCheckout.click();
  }

  async verifyCartItemVisible(productId: number) {
    await expect(this.getCartItem(productId)).toBeVisible();
  }

  async verifyCartItemNotVisible(productId: number) {
    await expect(this.getCartItem(productId)).not.toBeVisible();
  }

  async verifyEmptyCart() {
    await expect(this.emptyCart).toBeVisible();
  }

  async verifyQuantity(productId: number, expectedQty: number) {
    await expect(this.getItemQuantity(productId)).toHaveText(String(expectedQty));
  }
}
