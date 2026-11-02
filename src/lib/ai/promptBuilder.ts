import { WizardFormData } from '@/types/wizard';
import { RegulatoryRules } from '../regulatory/types';

export function buildHousePlanPrompt(data: WizardFormData, rules: RegulatoryRules): string {
  const plotArea = data.plot.width * data.plot.length;
  const setbacks = rules.getSetbacksForPlot(plotArea);

  return `You are a licensed chief structural architect and urban planner in India.
Design an optimal, buildable architectural house plan for a residential plot.

PLOT SPECIFICATIONS:
- Dimensions: ${data.plot.width} ft width x ${data.plot.length} ft length (Total area: ${plotArea} sq ft)
- Facing direction: ${data.plot.facing} (Adhere strictly to Indian Vastu principles where possible)
- City: ${data.plot.city}, ${data.plot.state}
- Development Authority: ${rules.authorityName} (${rules.authorityCode})

REGULATORY BYLAWS & SETBACKS (MANDATORY TO AVOID REJECTION):
- Required Front Setback: Min ${setbacks.frontMinFt} ft
- Required Rear Setback: Min ${setbacks.rearMinFt} ft
- Required Side Setback: Min ${setbacks.sideMinFt} ft
- Permissible Ground Coverage: Max ${rules.maxGroundCoveragePercent}%
- Permissible FAR: Max ${rules.maxFAR}

CLIENT REQUIREMENTS:
- Number of floors: ${data.requirements.floors} (Ground + ${data.requirements.floors - 1})
- Bedrooms: ${data.requirements.bedrooms}
- Bathrooms: ${data.requirements.bathrooms}
- Kitchen: ${data.requirements.kitchenType}
- Parking: ${data.requirements.parkingSpots} car(s)
- Pooja Room: ${data.requirements.hasPoojaRoom ? 'Yes (place in North-East if possible)' : 'No'}
- Architectural Style: ${data.preferences.style}
- Target Budget: ${data.budget.range} (${data.budget.qualityTier} finish)

Return a complete, dimensionally accurate plan in strict JSON.
All room coordinates (x, y, width, length) must fit inside the buildable envelope after setbacks.`;
}
