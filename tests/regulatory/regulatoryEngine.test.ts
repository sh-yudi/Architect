import { describe, it, expect } from 'vitest';
import { validateRegulatoryCompliance, getRegulatoryRules } from '@/lib/regulatory/engine';
import { HousePlan } from '@/types/plan';

describe('Regulatory Engine - GDA Ghaziabad', () => {
  const basePlan: HousePlan = {
    plot: { width: 30, length: 40, facing: 'East', area: 1200 },
    setbacks: { front: 10, rear: 7, left: 3, right: 3 },
    floors: [
      {
        level: 0,
        floorName: 'Ground',
        rooms: [{ id: 'r1', name: 'Living', x: 3, y: 10, width: 24, length: 25, doors: [], windows: [] }]
      }
    ],
    structural: { columns: [], beams: [], footingType: 'isolated', slabType: 'RCC' },
    electrical: { pointsByRoom: [] },
    plumbing: { inletPoints: [], outletPoints: [] },
    budget: { currency: 'INR', total: 2000000, lineItems: [] },
    facade: { style: 'Modern', features: [], exteriorMaterial: 'plaster' },
    regulatory: { far: 1.5, groundCoverage: 50, builtUpArea: 600, violations: [] }
  };

  it('should approve a compliant house plan under GDA rules', () => {
    const rules = getRegulatoryRules('GDA');
    const result = validateRegulatoryCompliance(basePlan, rules);
    expect(result.isCompliant).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.metrics.calculatedFAR).toBe(1.5);
    expect(result.metrics.maxAllowedFAR).toBe(rules.maxFAR);
    expect(result.metrics.calculatedCoveragePercent).toBe(50);
    expect(result.metrics.maxAllowedCoveragePercent).toBe(rules.maxGroundCoveragePercent);
  });

  it('should flag violation if front setback is below GDA minimum', () => {
    const nonCompliantPlan: HousePlan = {
      ...basePlan,
      setbacks: { front: 4, rear: 7, left: 3, right: 3 }, // GDA requires min 3m (~9.8ft) for this plot size (1200 sqft)
    };
    const rules = getRegulatoryRules('GDA');
    const result = validateRegulatoryCompliance(nonCompliantPlan, rules);
    expect(result.isCompliant).toBe(false);
    expect(result.violations.some(v => v.includes('Front setback'))).toBe(true);
  });

  it('should flag violation if rear setback is below GDA minimum', () => {
    const nonCompliantPlan: HousePlan = {
      ...basePlan,
      setbacks: { front: 10, rear: 4, left: 3, right: 3 }, // GDA requires min 6.5ft rear for 1200 sqft
    };
    const rules = getRegulatoryRules('GDA');
    const result = validateRegulatoryCompliance(nonCompliantPlan, rules);
    expect(result.isCompliant).toBe(false);
    expect(result.violations.some(v => v.includes('Rear setback'))).toBe(true);
  });

  it('should flag violation if side setback is below GDA minimum', () => {
    const nonCompliantPlan: HousePlan = {
      ...basePlan,
      setbacks: { front: 10, rear: 7, left: 2, right: 3 }, // GDA requires min 3.0ft side for 1200 sqft
    };
    const rules = getRegulatoryRules('GDA');
    const result = validateRegulatoryCompliance(nonCompliantPlan, rules);
    expect(result.isCompliant).toBe(false);
    expect(result.violations.some(v => v.includes('Side setback'))).toBe(true);
  });

  it('should flag violation if ground coverage exceeds maximum allowable', () => {
    const nonCompliantPlan: HousePlan = {
      ...basePlan,
      regulatory: { ...basePlan.regulatory, groundCoverage: 75 }, // GDA max 60%
    };
    const rules = getRegulatoryRules('GDA');
    const result = validateRegulatoryCompliance(nonCompliantPlan, rules);
    expect(result.isCompliant).toBe(false);
    expect(result.violations.some(v => v.includes('Ground coverage'))).toBe(true);
  });

  it('should flag violation if FAR exceeds maximum permissible', () => {
    const nonCompliantPlan: HousePlan = {
      ...basePlan,
      regulatory: { ...basePlan.regulatory, far: 2.5 }, // GDA max 2.0
    };
    const rules = getRegulatoryRules('GDA');
    const result = validateRegulatoryCompliance(nonCompliantPlan, rules);
    expect(result.isCompliant).toBe(false);
    expect(result.violations.some(v => v.includes('Floor Area Ratio'))).toBe(true);
  });

  it('should fallback to GDA baseline for unknown authority code', () => {
    const rules = getRegulatoryRules('UNKNOWN_AUTH');
    expect(rules.authorityCode).toBe('GDA');
  });

  it('should calculate setbacks correctly across different plot sizes', () => {
    const rules = getRegulatoryRules('GDA');
    // <= 1000 sq ft
    const smallPlotSetbacks = rules.getSetbacksForPlot(800);
    expect(smallPlotSetbacks.frontMinFt).toBe(6.5);
    expect(smallPlotSetbacks.rearMinFt).toBe(5.0);
    expect(smallPlotSetbacks.sideMinFt).toBe(0.0);

    // 1001 - 2000 sq ft
    const mediumPlotSetbacks = rules.getSetbacksForPlot(1500);
    expect(mediumPlotSetbacks.frontMinFt).toBe(9.8);
    expect(mediumPlotSetbacks.rearMinFt).toBe(6.5);
    expect(mediumPlotSetbacks.sideMinFt).toBe(3.0);

    // 2001 - 5000 sq ft
    const largePlotSetbacks = rules.getSetbacksForPlot(3000);
    expect(largePlotSetbacks.frontMinFt).toBe(14.7);
    expect(largePlotSetbacks.rearMinFt).toBe(9.8);
    expect(largePlotSetbacks.sideMinFt).toBe(6.5);

    // > 5000 sq ft
    const veryLargePlotSetbacks = rules.getSetbacksForPlot(6000);
    expect(veryLargePlotSetbacks.frontMinFt).toBe(19.6);
    expect(veryLargePlotSetbacks.rearMinFt).toBe(13.1);
    expect(veryLargePlotSetbacks.sideMinFt).toBe(9.8);
  });

  it('should provide required submissions list for GDA', () => {
    const rules = getRegulatoryRules('GDA');
    expect(rules.requiredSubmissions.length).toBeGreaterThan(0);
    expect(rules.requiredSubmissions).toContain('UPOBPAS Online DXF Drawing Submission (AutoDCR Standard)');
  });
});
