import { Page, Locator, expect } from '@playwright/test';
import logger from '../utils/logger';

/**
 * BasePage - Abstract page object providing common UI interactions.
 * All page objects should extend this class for reusability.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navigate to the page URL */
  abstract goto(): Promise<void>;

  /** Verify the page has loaded correctly */
  abstract isLoaded(): Promise<boolean>;

  /** Navigate to a specific URL path */
  protected async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    logger.info(`Navigated to: ${path}`);
  }

  /** Click an element by locator */
  protected async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /** Fill a text field */
  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  /** Get text content from a locator */
  protected async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) || '';
  }

  /** Select an option from a dropdown */
  protected async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  /** Check if an element is visible */
  protected async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /** Wait for a loading spinner to disappear */
  protected async waitForLoadingComplete(spinnerSelector = '.loading-spinner'): Promise<void> {
    const spinner = this.page.locator(spinnerSelector);
    if (await spinner.isVisible()) {
      await spinner.waitFor({ state: 'hidden', timeout: 30_000 });
    }
  }

  /** Verify a success message is displayed */
  protected async verifySuccessMessage(expectedMessage: string): Promise<void> {
    const toast = this.page.locator('.toast-success, .notification-success, [role="alert"]');
    await expect(toast).toContainText(expectedMessage);
  }

  /** Verify an error message is displayed */
  protected async verifyErrorMessage(expectedMessage: string): Promise<void> {
    const toast = this.page.locator('.toast-error, .notification-error, .error-message');
    await expect(toast).toContainText(expectedMessage);
  }

  /** Get the page title */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /** Take a screenshot */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }
}
