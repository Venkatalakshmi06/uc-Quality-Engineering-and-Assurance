import {
  Cost,
  TierPrice,
  PriceAdjustment,
  ShelfLifeInfo,
  MarkdownThreshold,
  ProductDimensions,
  FxRate,
  BomComponent,
  PriceCalculationResult,
} from '../types/pricing.types';

/**
 * Reusable pricing calculation utilities.
 * Mirrors the business logic defined in the Pricing BRD for verification.
 */
export class PriceCalculator {
  /**
   * Calculate cost-plus price: Cost × (1 + Markup%) + Adders
   */
  static costPlusPrice(cost: number, markupPercent: number, adders: number): number {
    return PriceCalculator.round(cost * (1 + markupPercent / 100) + adders);
  }

  /**
   * Determine the unit price based on quantity tiers.
   */
  static tieredPrice(quantity: number, tiers: TierPrice[]): number {
    const sorted = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
    for (const tier of sorted) {
      const maxQty = tier.maxQuantity ?? Infinity;
      if (quantity >= tier.minQuantity && quantity <= maxQty) {
        return tier.unitPrice;
      }
    }
    throw new Error(`No tier found for quantity ${quantity}`);
  }

  /**
   * Apply ordered adjustments in waterfall sequence:
   * Contract → Promo → Volume → Surcharge → Override → Rebate → Tax
   */
  static applyAdjustments(basePrice: number, adjustments: PriceAdjustment[]): number {
    let price = basePrice;
    const order: string[] = [
      'discount',
      'promotion',
      'surcharge',
      'override',
      'rebate',
      'markdown',
      'clearance',
    ];
    const sorted = [...adjustments].sort(
      (a, b) => order.indexOf(a.type) - order.indexOf(b.type),
    );
    for (const adj of sorted) {
      if (adj.isPercentage) {
        price = adj.type === 'surcharge' ? price * (1 + adj.value / 100) : price * (1 - adj.value / 100);
      } else {
        price = adj.type === 'surcharge' ? price + adj.value : price - adj.value;
      }
    }
    return PriceCalculator.round(price);
  }

  /**
   * Calculate margin percentage: (Price - Cost) / Price × 100
   */
  static marginPercent(price: number, cost: number): number {
    if (price === 0) return 0;
    return PriceCalculator.round(((price - cost) / price) * 100);
  }

  /**
   * Check if the price meets the minimum margin guardrail.
   */
  static meetsMarginGuardrail(price: number, cost: number, minMarginPercent: number): boolean {
    return PriceCalculator.marginPercent(price, cost) >= minMarginPercent;
  }

  /**
   * Convert price using FX rate.
   */
  static convertCurrency(amount: number, fxRate: FxRate): number {
    return PriceCalculator.round(amount * fxRate.rate);
  }

  /**
   * Calculate perishable markdown based on remaining shelf-life thresholds.
   */
  static perishableMarkdown(
    listPrice: number,
    shelfLife: ShelfLifeInfo,
    thresholds: MarkdownThreshold[],
  ): number {
    const remaining = shelfLife.remainingPercentage;
    const sorted = [...thresholds].sort((a, b) => b.minRemainingPercent - a.minRemainingPercent);
    for (const threshold of sorted) {
      if (remaining >= threshold.minRemainingPercent && remaining <= threshold.maxRemainingPercent) {
        return PriceCalculator.round(listPrice * (1 - threshold.markdownPercent / 100));
      }
    }
    return listPrice;
  }

  /**
   * Calculate dimensional weight: (L × W × H) / DIM factor
   */
  static dimensionalWeight(dims: ProductDimensions, dimFactor: number): number {
    return PriceCalculator.round((dims.length * dims.width * dims.height) / dimFactor);
  }

  /**
   * Calculate freight cost using greater of actual vs dimensional weight.
   */
  static freightCost(dims: ProductDimensions, dimFactor: number, ratePerUnit: number): number {
    const dimWeight = PriceCalculator.dimensionalWeight(dims, dimFactor);
    const billableWeight = Math.max(dims.actualWeight, dimWeight);
    return PriceCalculator.round(billableWeight * ratePerUnit);
  }

  /**
   * Roll up BOM component prices for configurable assemblies.
   */
  static bomRollup(components: BomComponent[], selectedOptionalIds: string[]): number {
    let total = 0;
    for (const comp of components) {
      if (!comp.isOptional || selectedOptionalIds.includes(comp.componentId)) {
        total += comp.price;
      }
    }
    return PriceCalculator.round(total);
  }

  /**
   * Calculate rebate accrual.
   */
  static rebateAccrual(salesVolume: number, accrualRate: number): number {
    return PriceCalculator.round(salesVolume * (accrualRate / 100));
  }

  /**
   * Validate price against regulatory ceiling/floor.
   */
  static validateRegulatoryLimits(
    price: number,
    priceCap?: number,
    priceFloor?: number,
  ): { valid: boolean; violations: string[] } {
    const violations: string[] = [];
    if (priceCap !== undefined && price > priceCap) {
      violations.push(`Price ${price} exceeds regulatory cap ${priceCap}`);
    }
    if (priceFloor !== undefined && price < priceFloor) {
      violations.push(`Price ${price} below regulatory floor ${priceFloor}`);
    }
    return { valid: violations.length === 0, violations };
  }

  /**
   * Calculate contract escalator price.
   */
  static contractEscalation(basePrice: number, escalatorPercent: number, years: number): number {
    return PriceCalculator.round(basePrice * Math.pow(1 + escalatorPercent / 100, years));
  }

  /**
   * Build a full price calculation result.
   */
  static calculateFullPrice(
    sku: string,
    cost: Cost,
    listPrice: number,
    adjustments: PriceAdjustment[],
    currency: string,
  ): PriceCalculationResult {
    const netPrice = PriceCalculator.applyAdjustments(listPrice, adjustments);
    const margin = netPrice - cost.standardCost;
    const marginPct = PriceCalculator.marginPercent(netPrice, cost.standardCost);
    return {
      sku,
      listPrice,
      netPrice,
      margin,
      marginPercent: marginPct,
      currency,
    };
  }

  /** Round to 2 decimal places */
  private static round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
