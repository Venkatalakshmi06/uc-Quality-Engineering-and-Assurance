import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";

test.describe("Add to Cart Feature", () => {
  test("should add product to cart from home page", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addProductToCart(1);

    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText("1");
  });

  test("should add product to cart from product detail page", async ({ page }) => {
    const productDetail = new ProductDetailPage(page);
    await productDetail.goto(2);
    await productDetail.addToCart();

    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText("1");
  });

  test("should increment quantity when adding same product twice", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addProductToCart(1);
    await homePage.addProductToCart(1);

    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText("2");

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.verifyQuantity(1, 2);
  });

  test("should add multiple different products to cart", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addProductToCart(1);
    await homePage.addProductToCart(2);
    await homePage.addProductToCart(3);

    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toHaveText("3");

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.verifyCartItemVisible(1);
    await cartPage.verifyCartItemVisible(2);
    await cartPage.verifyCartItemVisible(3);
  });

  test("should display correct items in cart page", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addProductToCart(1);

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.verifyCartItemVisible(1);
    await expect(cartPage.getCartItemName(1)).toContainText("Classic White Sneakers");
  });

  test("should increase item quantity in cart", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addProductToCart(1);

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.verifyQuantity(1, 1);

    await cartPage.increaseQuantity(1);
    await cartPage.verifyQuantity(1, 2);
  });

  test("should decrease item quantity in cart", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addProductToCart(1);
    await homePage.addProductToCart(1);

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.verifyQuantity(1, 2);

    await cartPage.decreaseQuantity(1);
    await cartPage.verifyQuantity(1, 1);
  });

  test("should remove item from cart when quantity decreases to zero", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addProductToCart(1);

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.decreaseQuantity(1);
    await cartPage.verifyEmptyCart();
  });

  test("should remove item from cart with remove button", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addProductToCart(1);
    await homePage.addProductToCart(2);

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.removeItem(1);
    await cartPage.verifyCartItemNotVisible(1);
    await cartPage.verifyCartItemVisible(2);
  });

  test("should clear all items from cart", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addProductToCart(1);
    await homePage.addProductToCart(2);

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.clearCart();
    await cartPage.verifyEmptyCart();
  });

  test("should show correct cart total", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.addProductToCart(1);
    await homePage.addProductToCart(2);

    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.cartTotal).toContainText("$239.98");
  });

  test("should show empty cart message when cart is empty", async ({ page }) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.verifyEmptyCart();
  });
});
