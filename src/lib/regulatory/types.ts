export interface SetbackRequirements {
  frontMinFt: number;
  rearMinFt: number;
  sideMinFt: number;
}

export interface RegulatoryRules {
  authorityCode: string;
  authorityName: string;
  portalUrl: string;
  maxFAR: number;
  maxGroundCoveragePercent: number;
  maxHeightFt: number;
  getSetbacksForPlot(plotAreaSqFt: number): SetbackRequirements;
  requiredSubmissions: string[];
}

export interface ComplianceResult {
  isCompliant: boolean;
  violations: string[];
  metrics: {
    calculatedFAR: number;
    maxAllowedFAR: number;
    calculatedCoveragePercent: number;
    maxAllowedCoveragePercent: number;
  };
}
