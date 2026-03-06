/**
 * Core type definitions for the Pricing BRD Automation Framework.
 * Covers all entities from the Pricing Data Model (Section 7 of BRD).
 */

/** Product entity with SCM-relevant attributes */
export interface Product {
  sku: string;
  name: string;
  family: string;
  uom: string;
  dimensions?: ProductDimensions;
  shelfLife?: ShelfLifeInfo;
  lifecycleStage?: LifecycleStage;
  productType: ProductType;
  classification?: string;
  isRegulated?: boolean;
  complianceMetadata?: ComplianceMetadata;
}

/** Product dimensions for oversized/bulky item calculations */
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  actualWeight: number;
  dimensionalWeight?: number;
  weightUnit: 'lbs' | 'kg';
}

/** Shelf-life info for perishable products */
export interface ShelfLifeInfo {
  expiryDate: string;
  totalShelfLifeDays: number;
  remainingPercentage: number;
}

/** Compliance metadata for regulated goods */
export interface ComplianceMetadata {
  regulatoryBody: string;
  priceCap?: number;
  priceFloor?: number;
  justificationRequired: boolean;
  lastAuditDate?: string;
}

/** Product types supported in the SCM pricing system */
export type ProductType =
  | 'commodity'
  | 'perishable'
  | 'regulated'
  | 'configurable'
  | 'oversized'
  | 'mro_spare'
  | 'standard';

/** Product lifecycle stages */
export type LifecycleStage = 'launch' | 'growth' | 'maturity' | 'decline' | 'clearance';

/** Customer entity */
export interface Customer {
  customerId: string;
  name: string;
  segment: CustomerSegment;
  region: string;
  channel: Channel;
  contractIds?: string[];
  rebateProgramIds?: string[];
}

export type CustomerSegment = 'enterprise' | 'mid-market' | 'small-business' | 'retail';
export type Channel = 'distributor' | 'direct' | 'ecommerce' | 'b2b' | 'retail';

/** PriceBook entity */
export interface PriceBook {
  priceBookId: string;
  region: string;
  channel: Channel;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string;
}

/** Price item (list, tiered, contract) */
export interface PriceItem {
  priceItemId: string;
  sku: string;
  priceBookId: string;
  listPrice: number;
  currency: string;
  tieredPrices?: TierPrice[];
  contractPrice?: number;
  effectiveFrom: string;
  effectiveTo: string;
}

/** Tier price structure for volume-based pricing */
export interface TierPrice {
  tierName: string;
  minQuantity: number;
  maxQuantity: number | null;
  unitPrice: number;
}

/** Cost entity */
export interface Cost {
  sku: string;
  standardCost: number;
  landedCost?: number;
  indexBasedCost?: number;
  currency: string;
  lastUpdated: string;
}

/** Price adjustments (discounts, surcharges, promos) */
export interface PriceAdjustment {
  adjustmentId: string;
  type: AdjustmentType;
  value: number;
  isPercentage: boolean;
  isCombinable: boolean;
  effectiveFrom: string;
  effectiveTo: string;
  appliesToSku?: string;
  appliesToFamily?: string;
}

export type AdjustmentType =
  | 'discount'
  | 'surcharge'
  | 'promotion'
  | 'override'
  | 'rebate'
  | 'markdown'
  | 'clearance';

/** Contract entity */
export interface Contract {
  contractId: string;
  customerId: string;
  effectiveFrom: string;
  effectiveTo: string;
  protectionWindowDays: number;
  escalatorPercentage?: number;
  items: ContractItem[];
}

export interface ContractItem {
  sku: string;
  contractPrice: number;
  currency: string;
}

/** Rebate program entity */
export interface RebateProgram {
  programId: string;
  name: string;
  eligibilityCriteria: string;
  accrualRate: number;
  settlementMethod: 'credit_memo' | 'check' | 'offset';
  effectiveFrom: string;
  effectiveTo: string;
}

/** Shelf-life policy for perishables */
export interface ShelfLifePolicy {
  policyId: string;
  productFamily: string;
  thresholds: MarkdownThreshold[];
}

export interface MarkdownThreshold {
  minRemainingPercent: number;
  maxRemainingPercent: number;
  markdownPercent: number;
}

/** Regulatory limit for regulated goods */
export interface RegulatoryLimit {
  sku: string;
  market: string;
  priceCap?: number;
  priceFloor?: number;
  effectiveFrom: string;
  effectiveTo: string;
}

/** Freight zone configuration */
export interface FreightZone {
  zoneId: string;
  zoneName: string;
  baseCost: number;
  dimWeightFactor: number;
  currency: string;
}

/** FX rate entry */
export interface FxRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
  source: string;
}

/** Audit log entry */
export interface AuditLogEntry {
  entryId: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  timestamp: string;
  approvalReference?: string;
}

/** BOM component for configurable assemblies */
export interface BomComponent {
  componentId: string;
  name: string;
  price: number;
  isOptional: boolean;
  isDefault: boolean;
}

/** Supersession mapping for MRO/spares */
export interface SupersessionMap {
  oldPartNumber: string;
  newPartNumber: string;
  effectiveDate: string;
}

/** Quote/deal request */
export interface QuoteRequest {
  quoteId: string;
  customerId: string;
  items: QuoteLineItem[];
  requestedDiscount?: number;
  rationale?: string;
  submittedBy: string;
  role: UserRole;
}

export interface QuoteLineItem {
  sku: string;
  quantity: number;
  requestedPrice?: number;
}

/** User roles for RBAC */
export type UserRole = 'sales_rep' | 'sales_manager' | 'pricing_admin' | 'finance' | 'cfo';

/** Price calculation result */
export interface PriceCalculationResult {
  sku: string;
  listPrice: number;
  contractPrice?: number;
  promotionDiscount?: number;
  surcharges?: number;
  overrides?: number;
  rebates?: number;
  taxes?: number;
  netPrice: number;
  margin: number;
  marginPercent: number;
  tierApplied?: string;
  currency: string;
  warnings?: string[];
  errors?: string[];
}

/** Incoterm types */
export type Incoterm = 'FOB' | 'CIF' | 'DDP' | 'EXW' | 'FCA' | 'DAP';

/** Order for pricing calculation */
export interface PricingOrder {
  orderId: string;
  customerId: string;
  channel: Channel;
  region: string;
  currency: string;
  incoterm: Incoterm;
  shipToZone?: string;
  items: OrderLineItem[];
}

export interface OrderLineItem {
  sku: string;
  quantity: number;
  configOptions?: string[];
}

/** Approval workflow status */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

/** Approval request */
export interface ApprovalRequest {
  requestId: string;
  type: 'price_change' | 'discount_override' | 'npi_pricing' | 'bulk_update';
  status: ApprovalStatus;
  requester: string;
  approver?: string;
  rationale?: string;
  timestamp: string;
}
