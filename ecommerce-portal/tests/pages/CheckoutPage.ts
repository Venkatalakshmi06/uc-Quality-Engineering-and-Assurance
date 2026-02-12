import { type Page, type Locator, expect } from "@playwright/test";

export class CheckoutPage {
  readonly page: Page;
  readonly checkoutTitle: Locator;
  readonly checkoutForm: Locator;
  readonly placeOrderButton: Locator;
  readonly orderConfirmation: Locator;
  readonly orderSuccessTitle: Locator;
  readonly orderNumber: Locator;
  readonly backToShopping: Locator;
  readonly checkoutTotal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutTitle = page.locator('[data-testid="checkout-title"]');
    this.checkoutForm = page.locator('[data-testid="checkout-form"]');
    this.placeOrderButton = page.locator('[data-testid="place-order-button"]');
    this.orderConfirmation = page.locator('[data-testid="order-confirmation"]');
    this.orderSuccessTitle = page.locator('[data-testid="order-success-title"]');
    this.orderNumber = page.locator('[data-testid="order-number"]');
    this.backToShopping = page.locator('[data-testid="back-to-shopping"]');
    this.checkoutTotal = page.locator('[data-testid="checkout-total"]');
  }

  async goto() {
    await this.page.goto("/checkout");
  }

  getInput(fieldName: string): Locator {
    return this.page.locator(`[data-testid="input-${fieldName}"]`);
  }

  getError(fieldName: string): Locator {
    return this.page.locator(`[data-testid="error-${fieldName}"]`);
  }

  getCheckoutItem(productId: number): Locator {
    return this.page.locator(`[data-testid="checkout-item-${productId}"]`);
  }

  async fillForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  }) {
    await this.getInput("firstName").fill(data.firstName);
    await this.getInput("lastName").fill(data.lastName);
    await this.getInput("email").fill(data.email);
    await this.getInput("address").fill(data.address);
    await this.getInput("city").fill(data.city);
    await this.getInput("zipCode").fill(data.zipCode);
    await this.getInput("cardNumber").fill(data.cardNumber);
    await this.getInput("expiryDate").fill(data.expiryDate);
    await this.getInput("cvv").fill(data.cvv);
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }

  async verifyOrderSuccess() {
    await expect(this.orderConfirmation).toBeVisible({ timeout: 10000 });
    await expect(this.orderSuccessTitle).toContainText("Order Placed Successfully");
  }

  async verifyValidationError(fieldName: string) {
    await expect(this.getError(fieldName)).toBeVisible();
  }

  async backToShop() {
    await this.backToShopping.click();
  }
}
