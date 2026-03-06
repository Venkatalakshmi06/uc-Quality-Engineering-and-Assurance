import {
  Product,
  Customer,
  Cost,
  TierPrice,
  PriceAdjustment,
  Contract,
  RebateProgram,
  ShelfLifePolicy,
  RegulatoryLimit,
  FreightZone,
  FxRate,
  BomComponent,
  SupersessionMap,
  PriceBook,
  QuoteRequest,
} from '../types/pricing.types';

/**
 * Centralized test data for the Pricing BRD Automation Framework.
 * Organized by functional area matching the BRD requirements.
 */

// ===================== PRODUCTS =====================
export const products: Record<string, Product> = {
  standard: {
    sku: 'SKU-1001',
    name: 'Industrial Bearing Assembly',
    family: 'Bearings',
    uom: 'EA',
    productType: 'standard',
    lifecycleStage: 'maturity',
  },
  commodity: {
    sku: 'SKU-2001',
    name: 'Steel Alloy Bar',
    family: 'Raw Materials',
    uom: 'KG',
    productType: 'commodity',
  },
  perishable: {
    sku: 'SKU-3001',
    name: 'Industrial Lubricant',
    family: 'Lubricants',
    uom: 'LTR',
    productType: 'perishable',
    shelfLife: {
      expiryDate: '2026-06-15',
      totalShelfLifeDays: 365,
      remainingPercentage: 45,
    },
  },
  regulated: {
    sku: 'SKU-4001',
    name: 'Medical Grade Tubing',
    family: 'Medical Supplies',
    uom: 'MTR',
    productType: 'regulated',
    isRegulated: true,
    complianceMetadata: {
      regulatoryBody: 'FDA',
      priceCap: 500.00,
      priceFloor: 50.00,
      justificationRequired: true,
    },
  },
  configurable: {
    sku: 'SKU-5001',
    name: 'Custom Hydraulic Pump',
    family: 'Hydraulics',
    uom: 'EA',
    productType: 'configurable',
  },
  oversized: {
    sku: 'SKU-6001',
    name: 'Industrial Compressor Unit',
    family: 'Heavy Equipment',
    uom: 'EA',
    productType: 'oversized',
    dimensions: {
      length: 120,
      width: 80,
      height: 100,
      actualWeight: 500,
      weightUnit: 'lbs',
    },
  },
  mroSpare: {
    sku: 'SKU-7001',
    name: 'Replacement Filter Cartridge',
    family: 'Spare Parts',
    uom: 'EA',
    productType: 'mro_spare',
  },
  launchProduct: {
    sku: 'SKU-8001',
    name: 'Next-Gen Sensor Module',
    family: 'Electronics',
    uom: 'EA',
    productType: 'standard',
    lifecycleStage: 'launch',
  },
  declineProduct: {
    sku: 'SKU-9001',
    name: 'Legacy Control Board',
    family: 'Electronics',
    uom: 'EA',
    productType: 'standard',
    lifecycleStage: 'decline',
  },
};

// ===================== CUSTOMERS =====================
export const customers: Record<string, Customer> = {
  enterprise: {
    customerId: 'CUST-001',
    name: 'Global Manufacturing Corp',
    segment: 'enterprise',
    region: 'US-East',
    channel: 'direct',
    contractIds: ['CNT-001'],
    rebateProgramIds: ['REB-001'],
  },
  midMarket: {
    customerId: 'CUST-002',
    name: 'Regional Parts Distributor',
    segment: 'mid-market',
    region: 'US-West',
    channel: 'distributor',
  },
  smallBusiness: {
    customerId: 'CUST-003',
    name: 'Local Workshop Ltd',
    segment: 'small-business',
    region: 'EU-West',
    channel: 'ecommerce',
  },
  retailCustomer: {
    customerId: 'CUST-004',
    name: 'Retail Chain Stores',
    segment: 'retail',
    region: 'APAC',
    channel: 'retail',
  },
};

// ===================== COSTS =====================
export const costs: Record<string, Cost> = {
  standard: {
    sku: 'SKU-1001',
    standardCost: 100.00,
    landedCost: 115.00,
    currency: 'USD',
    lastUpdated: '2026-01-15',
  },
  commodity: {
    sku: 'SKU-2001',
    standardCost: 50.00,
    indexBasedCost: 52.30,
    currency: 'USD',
    lastUpdated: '2026-03-01',
  },
  perishable: {
    sku: 'SKU-3001',
    standardCost: 30.00,
    currency: 'USD',
    lastUpdated: '2026-02-01',
  },
  regulated: {
    sku: 'SKU-4001',
    standardCost: 200.00,
    currency: 'USD',
    lastUpdated: '2026-01-20',
  },
  configurable: {
    sku: 'SKU-5001',
    standardCost: 800.00,
    currency: 'USD',
    lastUpdated: '2026-02-15',
  },
  oversized: {
    sku: 'SKU-6001',
    standardCost: 2500.00,
    landedCost: 2800.00,
    currency: 'USD',
    lastUpdated: '2026-01-10',
  },
  mroSpare: {
    sku: 'SKU-7001',
    standardCost: 15.00,
    currency: 'USD',
    lastUpdated: '2026-03-01',
  },
};

// ===================== TIER PRICES =====================
export const tierPrices: Record<string, TierPrice[]> = {
  standard: [
    { tierName: 'Tier 1', minQuantity: 1, maxQuantity: 99, unitPrice: 150.00 },
    { tierName: 'Tier 2', minQuantity: 100, maxQuantity: 499, unitPrice: 135.00 },
    { tierName: 'Tier 3', minQuantity: 500, maxQuantity: 999, unitPrice: 120.00 },
    { tierName: 'Tier 4', minQuantity: 1000, maxQuantity: null, unitPrice: 105.00 },
  ],
  commodity: [
    { tierName: 'Small', minQuantity: 1, maxQuantity: 1000, unitPrice: 55.00 },
    { tierName: 'Medium', minQuantity: 1001, maxQuantity: 5000, unitPrice: 50.00 },
    { tierName: 'Large', minQuantity: 5001, maxQuantity: null, unitPrice: 45.00 },
  ],
};

// ===================== PRICE ADJUSTMENTS =====================
export const adjustments: Record<string, PriceAdjustment> = {
  volumeDiscount: {
    adjustmentId: 'ADJ-001',
    type: 'discount',
    value: 10,
    isPercentage: true,
    isCombinable: true,
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
  },
  promoDiscount: {
    adjustmentId: 'ADJ-002',
    type: 'promotion',
    value: 15,
    isPercentage: true,
    isCombinable: true,
    effectiveFrom: '2026-03-01',
    effectiveTo: '2026-03-31',
  },
  fuelSurcharge: {
    adjustmentId: 'ADJ-003',
    type: 'surcharge',
    value: 5,
    isPercentage: true,
    isCombinable: true,
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
  },
  dealOverride: {
    adjustmentId: 'ADJ-004',
    type: 'override',
    value: 20,
    isPercentage: false,
    isCombinable: false,
    effectiveFrom: '2026-03-01',
    effectiveTo: '2026-06-30',
  },
  clearanceMarkdown: {
    adjustmentId: 'ADJ-005',
    type: 'clearance',
    value: 40,
    isPercentage: true,
    isCombinable: false,
    effectiveFrom: '2026-03-01',
    effectiveTo: '2026-04-30',
  },
};

// ===================== CONTRACTS =====================
export const contracts: Record<string, Contract> = {
  active: {
    contractId: 'CNT-001',
    customerId: 'CUST-001',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2027-12-31',
    protectionWindowDays: 90,
    escalatorPercentage: 3,
    items: [
      { sku: 'SKU-1001', contractPrice: 120.00, currency: 'USD' },
      { sku: 'SKU-2001', contractPrice: 48.00, currency: 'USD' },
    ],
  },
  expired: {
    contractId: 'CNT-002',
    customerId: 'CUST-002',
    effectiveFrom: '2024-01-01',
    effectiveTo: '2025-12-31',
    protectionWindowDays: 60,
    items: [
      { sku: 'SKU-1001', contractPrice: 110.00, currency: 'USD' },
    ],
  },
};

// ===================== REBATE PROGRAMS =====================
export const rebatePrograms: Record<string, RebateProgram> = {
  standard: {
    programId: 'REB-001',
    name: 'Annual Volume Rebate',
    eligibilityCriteria: 'Annual spend > $100,000',
    accrualRate: 3,
    settlementMethod: 'credit_memo',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
  },
  premium: {
    programId: 'REB-002',
    name: 'Premium Partner Rebate',
    eligibilityCriteria: 'Annual spend > $500,000',
    accrualRate: 5,
    settlementMethod: 'check',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
  },
};

// ===================== SHELF-LIFE POLICIES =====================
export const shelfLifePolicies: Record<string, ShelfLifePolicy> = {
  lubricants: {
    policyId: 'SLP-001',
    productFamily: 'Lubricants',
    thresholds: [
      { minRemainingPercent: 50, maxRemainingPercent: 75, markdownPercent: 10 },
      { minRemainingPercent: 25, maxRemainingPercent: 49, markdownPercent: 25 },
      { minRemainingPercent: 10, maxRemainingPercent: 24, markdownPercent: 50 },
      { minRemainingPercent: 0, maxRemainingPercent: 9, markdownPercent: 75 },
    ],
  },
};

// ===================== REGULATORY LIMITS =====================
export const regulatoryLimits: Record<string, RegulatoryLimit> = {
  medicalTubing: {
    sku: 'SKU-4001',
    market: 'US',
    priceCap: 500.00,
    priceFloor: 50.00,
    effectiveFrom: '2026-01-01',
    effectiveTo: '2027-12-31',
  },
};

// ===================== FREIGHT ZONES =====================
export const freightZones: Record<string, FreightZone> = {
  domestic: {
    zoneId: 'FZ-001',
    zoneName: 'US Domestic',
    baseCost: 10.00,
    dimWeightFactor: 139,
    currency: 'USD',
  },
  international: {
    zoneId: 'FZ-002',
    zoneName: 'International',
    baseCost: 25.00,
    dimWeightFactor: 166,
    currency: 'USD',
  },
};

// ===================== FX RATES =====================
export const fxRates: Record<string, FxRate> = {
  usdToEur: {
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    rate: 0.92,
    date: '2026-03-01',
    source: 'ECB',
  },
  usdToGbp: {
    fromCurrency: 'USD',
    toCurrency: 'GBP',
    rate: 0.79,
    date: '2026-03-01',
    source: 'BOE',
  },
  usdToJpy: {
    fromCurrency: 'USD',
    toCurrency: 'JPY',
    rate: 149.50,
    date: '2026-03-01',
    source: 'BOJ',
  },
};

// ===================== BOM COMPONENTS =====================
export const bomComponents: Record<string, BomComponent[]> = {
  hydraulicPump: [
    { componentId: 'COMP-001', name: 'Pump Housing', price: 250.00, isOptional: false, isDefault: true },
    { componentId: 'COMP-002', name: 'Motor Assembly', price: 350.00, isOptional: false, isDefault: true },
    { componentId: 'COMP-003', name: 'Control Valve', price: 120.00, isOptional: false, isDefault: true },
    { componentId: 'COMP-004', name: 'Premium Seal Kit', price: 80.00, isOptional: true, isDefault: false },
    { componentId: 'COMP-005', name: 'Extended Warranty Module', price: 50.00, isOptional: true, isDefault: false },
  ],
};

// ===================== SUPERSESSION MAPS =====================
export const supersessionMaps: SupersessionMap[] = [
  { oldPartNumber: 'SKU-7001-V1', newPartNumber: 'SKU-7001', effectiveDate: '2026-01-15' },
  { oldPartNumber: 'SKU-7002-V1', newPartNumber: 'SKU-7002', effectiveDate: '2026-02-01' },
];

// ===================== PRICE BOOKS =====================
export const priceBooks: Record<string, PriceBook> = {
  usDistributor: {
    priceBookId: 'PB-001',
    region: 'US-East',
    channel: 'distributor',
    currency: 'USD',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
  },
  euDirect: {
    priceBookId: 'PB-002',
    region: 'EU-West',
    channel: 'direct',
    currency: 'EUR',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
  },
  apacEcommerce: {
    priceBookId: 'PB-003',
    region: 'APAC',
    channel: 'ecommerce',
    currency: 'USD',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
  },
};

// ===================== QUOTE REQUESTS =====================
export const quoteRequests: Record<string, QuoteRequest> = {
  standardDeal: {
    quoteId: 'QR-001',
    customerId: 'CUST-001',
    items: [
      { sku: 'SKU-1001', quantity: 500, requestedPrice: 115.00 },
      { sku: 'SKU-2001', quantity: 2000, requestedPrice: 47.00 },
    ],
    requestedDiscount: 8,
    rationale: 'Large volume strategic deal with key account',
    submittedBy: 'john.sales',
    role: 'sales_rep',
  },
  aggressiveDeal: {
    quoteId: 'QR-002',
    customerId: 'CUST-002',
    items: [
      { sku: 'SKU-1001', quantity: 100, requestedPrice: 90.00 },
    ],
    requestedDiscount: 40,
    rationale: 'Competitor match - aggressive pricing',
    submittedBy: 'jane.sales',
    role: 'sales_rep',
  },
};

// ===================== INVALID TEST DATA =====================
export const invalidData = {
  negativeCost: -100.00,
  zeroCost: 0,
  negativeMarkup: -25,
  excessiveMarkup: 10000,
  zeroQuantity: 0,
  negativeQuantity: -5,
  invalidSku: 'INVALID-SKU-999',
  invalidCurrency: 'ZZZ',
  futurePastDate: '1900-01-01',
  emptyString: '',
  specialChars: '<script>alert("xss")</script>',
  longString: 'A'.repeat(10001),
  maxInt: Number.MAX_SAFE_INTEGER,
  floatPrecision: 0.1 + 0.2,
  sqlInjection: "'; DROP TABLE prices; --",
};
