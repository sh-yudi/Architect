import { HousePlan } from '@/types/plan';
import { ComplianceResult, RegulatoryRules } from './types';
import { gdaRules } from './rules/gda';

const rulesRegistry: Record<string, RegulatoryRules> = {
  GDA: gdaRules,
};

export function getRegulatoryRules(authorityCode: string): RegulatoryRules {
  const rules = rulesRegistry[authorityCode?.toUpperCase()];
  if (!rules) {
    // Fallback to GDA baseline if unknown authority
    return gdaRules;
  }
  return rules;
}

export function validateRegulatoryCompliance(plan: HousePlan, rules: RegulatoryRules): ComplianceResult {
  const violations: string[] = [];
  const requiredSetbacks = rules.getSetbacksForPlot(plan.plot.area);

  if (plan.setbacks.front < requiredSetbacks.frontMinFt) {
    violations.push(
      `Front setback (${plan.setbacks.front}ft) is below required minimum of ${requiredSetbacks.frontMinFt}ft under ${rules.authorityName} bylaws.`
    );
  }

  if (plan.setbacks.rear < requiredSetbacks.rearMinFt) {
    violations.push(
      `Rear setback (${plan.setbacks.rear}ft) is below required minimum of ${requiredSetbacks.rearMinFt}ft.`
    );
  }

  const minSide = Math.min(plan.setbacks.left, plan.setbacks.right);
  if (minSide < requiredSetbacks.sideMinFt) {
    violations.push(
      `Side setback (${minSide}ft) is below required minimum of ${requiredSetbacks.sideMinFt}ft.`
    );
  }

  if (plan.regulatory.groundCoverage > rules.maxGroundCoveragePercent) {
    violations.push(
      `Ground coverage (${plan.regulatory.groundCoverage}%) exceeds maximum allowable ${rules.maxGroundCoveragePercent}%.`
    );
  }

  if (plan.regulatory.far > rules.maxFAR) {
    violations.push(
      `Floor Area Ratio (${plan.regulatory.far}) exceeds maximum permissible FAR of ${rules.maxFAR}.`
    );
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    metrics: {
      calculatedFAR: plan.regulatory.far,
      maxAllowedFAR: rules.maxFAR,
      calculatedCoveragePercent: plan.regulatory.groundCoverage,
      maxAllowedCoveragePercent: rules.maxGroundCoveragePercent,
    },
  };
}
