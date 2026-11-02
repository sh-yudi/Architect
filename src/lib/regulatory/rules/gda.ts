import { RegulatoryRules, SetbackRequirements } from '../types';

export const gdaRules: RegulatoryRules = {
  authorityCode: 'GDA',
  authorityName: 'Ghaziabad Development Authority',
  portalUrl: 'https://upobpas.in',
  maxFAR: 2.0,
  maxGroundCoveragePercent: 60,
  maxHeightFt: 45,
  getSetbacksForPlot(plotAreaSqFt: number): SetbackRequirements {
    // UP Building By-laws setback table for residential plots
    if (plotAreaSqFt <= 1000) {
      return { frontMinFt: 6.5, rearMinFt: 5.0, sideMinFt: 0.0 };
    } else if (plotAreaSqFt <= 2000) {
      return { frontMinFt: 9.8, rearMinFt: 6.5, sideMinFt: 3.0 }; // ~3m front, ~2m rear, ~1m side
    } else if (plotAreaSqFt <= 5000) {
      return { frontMinFt: 14.7, rearMinFt: 9.8, sideMinFt: 6.5 };
    }
    return { frontMinFt: 19.6, rearMinFt: 13.1, sideMinFt: 9.8 };
  },
  requiredSubmissions: [
    'UPOBPAS Online DXF Drawing Submission (AutoDCR Standard)',
    'Notarized Building Plan Indemnity Affidavit',
    'Proof of Plot Ownership (Registered Sale Deed / Allotment Letter)',
    'Supervision Certificate by Empanelled Licensed Technical Person (Architect)'
  ],
};
