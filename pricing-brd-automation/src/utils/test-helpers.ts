import { Page, expect } from '@playwright/test';
import logger from './logger';

/**
 * Reusable test helper utilities for the Pricing BRD Automation Framework.
 */
export class TestHelpers {
  /**
   * Wait for an element to be visible and return it.
   */
  static async waitForElement(page: Page, selector: string, timeout = 10_000) {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  /**
   * Fill a form field and verify the value was set.
   */
  static async fillAndVerify(page: Page, selector: string, value: string) {
    const field = page.locator(selector);
    await field.fill(value);
    await expect(field).toHaveValue(value);
    logger.info(`Filled field ${selector} with value: ${value}`);
  }

  /**
   * Select a dropdown option and verify.
   */
  static async selectAndVerify(page: Page, selector: string, value: string) {
    await page.locator(selector).selectOption(value);
    await expect(page.locator(selector)).toHaveValue(value);
    logger.info(`Selected option ${value} in ${selector}`);
  }

  /**
   * Click a button and wait for navigation or response.
   */
  static async clickAndWait(page: Page, selector: string, waitForUrl?: string) {
    if (waitForUrl) {
      await Promise.all([page.waitForURL(waitForUrl), page.locator(selector).click()]);
    } else {
      await page.locator(selector).click();
    }
    logger.info(`Clicked element ${selector}`);
  }

  /**
   * Verify a toast/notification message appears.
   */
  static async verifyNotification(page: Page, message: string, timeout = 5_000) {
    const notification = page.getByText(message);
    await expect(notification).toBeVisible({ timeout });
    logger.info(`Notification verified: ${message}`);
  }

  /**
   * Verify table cell content by row and column.
   */
  static async verifyTableCell(
    page: Page,
    tableSelector: string,
    row: number,
    col: number,
    expectedValue: string,
  ) {
    const cell = page.locator(`${tableSelector} tbody tr:nth-child(${row}) td:nth-child(${col})`);
    await expect(cell).toContainText(expectedValue);
  }

  /**
   * Verify validation error message.
   */
  static async verifyValidationError(page: Page, fieldSelector: string, errorMessage: string) {
    const errorEl = page.locator(`${fieldSelector} ~ .error-message, [data-error-for="${fieldSelector}"]`);
    await expect(errorEl).toContainText(errorMessage);
    logger.info(`Validation error verified for ${fieldSelector}: ${errorMessage}`);
  }

  /**
   * Compare two numbers with tolerance for floating-point precision.
   */
  static assertApproxEqual(actual: number, expected: number, tolerance = 0.01): void {
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
      throw new Error(
        `Expected ${expected} but got ${actual} (diff: ${diff}, tolerance: ${tolerance})`,
      );
    }
  }

  /**
   * Format a number as currency string.
   */
  static formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  /**
   * Generate a unique test identifier.
   */
  static generateTestId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Take a screenshot with a descriptive name.
   */
  static async takeScreenshot(page: Page, name: string) {
    const screenshotPath = `reports/screenshots/${name}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  /**
   * Wait for API response and return JSON body.
   */
  static async waitForApiResponse(page: Page, urlPattern: string | RegExp) {
    const response = await page.waitForResponse(urlPattern);
    const body = await response.json();
    logger.info(`API response received for ${urlPattern}: status ${response.status()}`);
    return { status: response.status(), body };
  }

  /**
   * Retry an action with configurable attempts.
   */
  static async retry<T>(action: () => Promise<T>, maxAttempts = 3, delayMs = 1_000): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}`);
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
    throw lastError;
  }

  /**
   * Validate date format (ISO 8601).
   */
  static isValidISODate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }
}
