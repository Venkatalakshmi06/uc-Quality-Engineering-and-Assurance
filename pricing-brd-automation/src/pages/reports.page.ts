import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * ReportsPage - Page object for Pricing Reports & Analytics.
 */
export class ReportsPage extends BasePage {
  readonly reportTypeSelector: Locator;
  readonly dateRangeFrom: Locator;
  readonly dateRangeTo: Locator;
  readonly generateButton: Locator;
  readonly exportButton: Locator;
  readonly reportTable: Locator;
  readonly chartContainer: Locator;
  readonly filterPanel: Locator;
  readonly noDataMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.reportTypeSelector = page.locator('[data-testid="report-type"]');
    this.dateRangeFrom = page.locator('[data-testid="date-from"]');
    this.dateRangeTo = page.locator('[data-testid="date-to"]');
    this.generateButton = page.locator('[data-testid="generate-report-btn"]');
    this.exportButton = page.locator('[data-testid="export-btn"]');
    this.reportTable = page.locator('[data-testid="report-table"]');
    this.chartContainer = page.locator('[data-testid="chart-container"]');
    this.filterPanel = page.locator('[data-testid="filter-panel"]');
    this.noDataMessage = page.locator('[data-testid="no-data-message"]');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/pricing/reports');
  }

  async isLoaded(): Promise<boolean> {
    return this.reportTypeSelector.isVisible();
  }

  /** Generate a report of a specific type */
  async generateReport(
    reportType: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<void> {
    await this.selectOption(this.reportTypeSelector, reportType);
    await this.fill(this.dateRangeFrom, dateFrom);
    await this.fill(this.dateRangeTo, dateTo);
    await this.click(this.generateButton);
    await this.waitForLoadingComplete();
  }

  /** Export report */
  async exportReport(): Promise<void> {
    await this.click(this.exportButton);
    await this.waitForLoadingComplete();
  }

  /** Get report row count */
  async getRowCount(): Promise<number> {
    return this.reportTable.locator('tbody tr').count();
  }

  /** Check if chart is displayed */
  async isChartDisplayed(): Promise<boolean> {
    return this.chartContainer.isVisible();
  }
}
