import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.describe("Search Product Feature", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test("should display all products initially", async () => {
    const count = await homePage.getProductCount();
    expect(count).toBe(12);
    await expect(homePage.productGrid).toBeVisible();
  });

  test("should filter products by name search", async () => {
    await homePage.searchProduct("Sneakers");
    const count = await homePage.getProductCount();
    expect(count).toBe(1);
    await homePage.verifyProductVisible(1);
  });

  test("should filter products by category keyword", async () => {
    await homePage.searchProduct("Electronics");
    const count = await homePage.getProductCount();
    expect(count).toBe(3);
  });

  test("should filter products by description keyword", async () => {
    await homePage.searchProduct("leather");
    const count = await homePage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test("should show no results for non-existing product", async () => {
    await homePage.searchProduct("xyznonexistent");
    await expect(homePage.noResults).toBeVisible();
    const count = await homePage.getProductCount();
    expect(count).toBe(0);
  });

  test("should filter products by category dropdown", async () => {
    await homePage.selectCategory("Footwear");
    const count = await homePage.getProductCount();
    expect(count).toBe(2);
    await homePage.verifyProductVisible(1);
    await homePage.verifyProductVisible(12);
  });

  test("should combine search and category filter", async () => {
    await homePage.searchProduct("Running");
    await homePage.selectCategory("Footwear");
    const count = await homePage.getProductCount();
    expect(count).toBe(1);
    await homePage.verifyProductVisible(12);
  });

  test("should clear search and show all products", async () => {
    await homePage.searchProduct("Sneakers");
    let count = await homePage.getProductCount();
    expect(count).toBe(1);

    await homePage.clearSearch();
    count = await homePage.getProductCount();
    expect(count).toBe(12);
  });

  test("should be case insensitive search", async () => {
    await homePage.searchProduct("sneakers");
    const count = await homePage.getProductCount();
    expect(count).toBe(1);
    await homePage.verifyProductVisible(1);
  });
});
