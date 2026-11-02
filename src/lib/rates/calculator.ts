import { BudgetSummary } from '@/types/plan';
import { cityMaterialRates } from './seedRates';

export type QualityTier = 'economy' | 'standard' | 'premium' | 'luxury';

const qualityMultipliers: Record<QualityTier, number> = {
  economy: 0.85,
  standard: 1.0,
  premium: 1.25,
  luxury: 1.6,
};

export function calculateDetailedBOQ(
  builtUpAreaSqFt: number,
  city: string,
  qualityTier: QualityTier = 'standard'
): BudgetSummary {
  if (builtUpAreaSqFt <= 0) {
    throw new Error('builtUpAreaSqFt must be greater than 0');
  }

  const rates = cityMaterialRates[city] || cityMaterialRates['Delhi/NCR'];
  const multiplier = qualityMultipliers[qualityTier];

  // Engineering approximations per sq ft of built-up area in residential construction
  // 1 sq ft needs ~0.4 bags cement, ~4 kg steel, ~22 bricks, 1 sq ft civil labour
  const cementCost = Math.round(builtUpAreaSqFt * 0.4 * rates.cementPerBag * multiplier);
  const steelCost = Math.round(builtUpAreaSqFt * 3.8 * rates.steelFe500DPerKg * multiplier);
  const bricksCost = Math.round(builtUpAreaSqFt * 20 * rates.redBrickPerPiece * multiplier);
  const sandAggregateCost = Math.round(builtUpAreaSqFt * 160 * multiplier);
  const civilLabourCost = Math.round(builtUpAreaSqFt * rates.civilLabourPerSqFt);

  const totalCivil = cementCost + steelCost + bricksCost + sandAggregateCost + civilLabourCost;

  const flooringTiling = Math.round(builtUpAreaSqFt * 140 * multiplier);
  const doorsWindows = Math.round(builtUpAreaSqFt * 110 * multiplier);
  const paintingFinishing = Math.round(builtUpAreaSqFt * 90 * multiplier);
  const finishingLabour = Math.round(builtUpAreaSqFt * rates.finishingLabourPerSqFt * multiplier);

  const electricalWiringPoints = Math.round(builtUpAreaSqFt * 85 * multiplier);
  const plumbingSanitary = Math.round(builtUpAreaSqFt * 75 * multiplier);

  const architectRegulatoryApprovals = 45000;

  const lineItems = [
    { category: 'civil' as const, name: 'RCC Structure, Steel & Masonry', amount: totalCivil },
    { category: 'finishing' as const, name: 'Flooring, Tiling & Cladding', amount: flooringTiling },
    { category: 'finishing' as const, name: 'Doors, Windows & Ironmongery', amount: doorsWindows },
    { category: 'finishing' as const, name: 'Internal & External Painting', amount: paintingFinishing },
    { category: 'finishing' as const, name: 'Finishing Labour & Carpentry', amount: finishingLabour },
    { category: 'services' as const, name: 'Electrical Wiring & Fixtures', amount: electricalWiringPoints },
    { category: 'services' as const, name: 'Plumbing & Drainage Network', amount: plumbingSanitary },
    { category: 'regulatory' as const, name: 'Municipal Sanction & Approval Consultation', amount: architectRegulatoryApprovals },
  ];

  const total = lineItems.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    currency: 'INR',
    total,
    lineItems,
  };
}
