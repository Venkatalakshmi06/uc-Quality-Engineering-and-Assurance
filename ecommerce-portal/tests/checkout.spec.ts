import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { testUser } from "./fixtures/test-data";

test.describe("Checkout Feature", () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addProductToCart(1);
  });

  test("should navigate to checkout from cart", async ({ page }) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.proceedCheckout();

    const checkoutPage = new CheckoutPage(page);
    await expect(checkoutPage.checkoutTitle).toBeVisible();
  });

  test("should display order summary on checkout page", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    await expect(checkoutPage.checkoutTitle).toBeVisible();
    await expect(checkoutPage.getCheckoutItem(1)).toBeVisible();
    await expect(checkoutPage.checkoutTotal).toContainText("$89.99");
  });

  test("should show validation errors for empty form submission", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();
    await checkoutPage.placeOrder();

    await checkoutPage.verifyValidationError("firstName");
    await checkoutPage.verifyValidationError("lastName");
    await checkoutPage.verifyValidationError("email");
    await checkoutPage.verifyValidationError("address");
    await checkoutPage.verifyValidationError("city");
    await checkoutPage.verifyValidationError("zipCode");
    await checkoutPage.verifyValidationError("cardNumber");
    await checkoutPage.verifyValidationError("expiryDate");
    await checkoutPage.verifyValidationError("cvv");
  });

  test("should show error for invalid email format", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    await checkoutPage.fillForm({ ...testUser, email: "invalidemail" });
    await checkoutPage.placeOrder();

    await checkoutPage.verifyValidationError("email");
  });

  test("should show error for short card number", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    await checkoutPage.fillForm({ ...testUser, cardNumber: "1234" });
    await checkoutPage.placeOrder();

    await checkoutPage.verifyValidationError("cardNumber");
  });

  test("should show error for short CVV", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    await checkoutPage.fillForm({ ...testUser, cvv: "12" });
    await checkoutPage.placeOrder();

    await checkoutPage.verifyValidationError("cvv");
  });

  test("should successfully place an order with valid data", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    await checkoutPage.fillForm(testUser);
    await checkoutPage.placeOrder();

    await checkoutPage.verifyOrderSuccess();
    await expect(checkoutPage.orderNumber).toBeVisible();
  });

  test("should navigate back to shopping after order confirmation", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    await checkoutPage.fillForm(testUser);
    await checkoutPage.placeOrder();
    await checkoutPage.verifyOrderSuccess();

    await checkoutPage.backToShop();
    const homePage = new HomePage(page);
    await expect(homePage.pageTitle).toBeVisible();
  });

  test("should show processing state during order submission", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    await checkoutPage.fillForm(testUser);
    await checkoutPage.placeOrder();

    await expect(checkoutPage.placeOrderButton).toContainText("Processing...");
  });

  test("should clear cart after successful order", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();

    await checkoutPage.fillForm(testUser);
    await checkoutPage.placeOrder();
    await checkoutPage.verifyOrderSuccess();

    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).not.toBeVisible();
  });

  test("complete end-to-end checkout flow", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.addProductToCart(2);
    await homePage.addProductToCart(3);

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.verifyCartItemVisible(1);
    await cartPage.verifyCartItemVisible(2);
    await cartPage.verifyCartItemVisible(3);
    await cartPage.proceedCheckout();

    const checkoutPage = new CheckoutPage(page);
    await expect(checkoutPage.checkoutTitle).toBeVisible();

    await checkoutPage.fillForm(testUser);
    await checkoutPage.placeOrder();

    await checkoutPage.verifyOrderSuccess();
    await expect(checkoutPage.orderNumber).toBeVisible();
  });
});
