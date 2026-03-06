import { test as base } from '@playwright/test';
import { PricingModulePage } from '../pages/pricing-module.page';
import { CostPlusPage } from '../pages/cost-plus.page';
import { TieredPricingPage } from '../pages/tiered-pricing.page';
import { ContractPricingPage } from '../pages/contract-pricing.page';
import { ApprovalWorkflowPage } from '../pages/approval-workflow.page';
import { ReportsPage } from '../pages/reports.page';

/**
 * Custom Playwright fixtures providing pre-initialized page objects.
 * This promotes reusability and DRY principles across all test suites.
 */
type PricingFixtures = {
  pricingPage: PricingModulePage;
  costPlusPage: CostPlusPage;
  tieredPricingPage: TieredPricingPage;
  contractPricingPage: ContractPricingPage;
  approvalWorkflowPage: ApprovalWorkflowPage;
  reportsPage: ReportsPage;
};

export const test = base.extend<PricingFixtures>({
  pricingPage: async ({ page }, use) => {
    const pricingPage = new PricingModulePage(page);
    await use(pricingPage);
  },

  costPlusPage: async ({ page }, use) => {
    const costPlusPage = new CostPlusPage(page);
    await use(costPlusPage);
  },

  tieredPricingPage: async ({ page }, use) => {
    const tieredPricingPage = new TieredPricingPage(page);
    await use(tieredPricingPage);
  },

  contractPricingPage: async ({ page }, use) => {
    const contractPricingPage = new ContractPricingPage(page);
    await use(contractPricingPage);
  },

  approvalWorkflowPage: async ({ page }, use) => {
    const approvalWorkflowPage = new ApprovalWorkflowPage(page);
    await use(approvalWorkflowPage);
  },

  reportsPage: async ({ page }, use) => {
    const reportsPage = new ReportsPage(page);
    await use(reportsPage);
  },
});

export { expect } from '@playwright/test';
