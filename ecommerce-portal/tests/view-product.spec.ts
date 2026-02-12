import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";

test.describe("View Product Feature", () => {
  test("should navigate to product detail page from home", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.clickProduct(1);

    const productDetail = new ProductDetailPage(page);
    await productDetail.verifyProductDetails({
      name: "Classic White Sneakers",
      price: "$89.99",
      category: "Footwear",
      inStock: true,
    });
  });

  test("should display product detail page with all information", async ({ page }) => {
    const productDetail = new ProductDetailPage(page);
    await productDetail.goto(2);

    await productDetail.verifyProductDetails({
      name: "Wireless Bluetooth Headphones",
      price: "$149.99",
      category: "Electronics",
      inStock: true,
    });
    await expect(productDetail.productDescription).toContainText("noise cancelling");
    await expect(productDetail.productImage).toBeVisible();
    await expect(productDetail.addToCartButton).toBeVisible();
    await expect(productDetail.buyNowButton).toBeVisible();
  });

  test("should navigate back from product detail", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.clickProduct(3);

    const productDetail = new ProductDetailPage(page);
    await expect(productDetail.productName).toContainText("Organic Cotton T-Shirt");

    await productDetail.goBack();
    await expect(homePage.pageTitle).toBeVisible();
  });

  test("should display correct product when accessed via direct URL", async ({ page }) => {
    const productDetail = new ProductDetailPage(page);
    await productDetail.goto(6);

    await productDetail.verifyProductDetails({
      name: "Smart Fitness Watch",
      price: "$199.99",
      category: "Electronics",
    });
  });

  test("should display product images correctly", async ({ page }) => {
    const productDetail = new ProductDetailPage(page);
    await productDetail.goto(1);

    await expect(productDetail.productImage).toBeVisible();
    await expect(productDetail.productImage).toHaveAttribute("alt", "Classic White Sneakers");
  });

  test("should show stock status on product detail page", async ({ page }) => {
    const productDetail = new ProductDetailPage(page);
    await productDetail.goto(4);

    await expect(productDetail.productStock).toContainText("In Stock");
  });
});
