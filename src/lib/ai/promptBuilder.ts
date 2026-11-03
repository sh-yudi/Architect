import { WizardFormData } from '@/types/wizard';
import { RegulatoryRules } from '../regulatory/types';

export function buildHousePlanPrompt(data: WizardFormData, rules: RegulatoryRules): string {
  const plotArea = data.plot.width * data.plot.length;
  const setbacks = rules.getSetbacksForPlot(plotArea);

  const customWishlistSection = data.customWishlist && data.customWishlist.trim().length > 0
    ? `
CLIENT'S DETAILED VISION & CUSTOM HOUSE REQUIREMENTS (CRITICAL PRIORITY):
"""
${data.customWishlist.trim()}
"""
CRITICAL DIRECTIVE: You MUST tailor the floor plans, room distributions, special spaces, and circulation strictly around the client's custom description above.
`
    : '';

  return `You are a licensed chief structural architect and urban planner in India.
Design an optimal, buildable, photorealistic architectural house plan for a residential plot.
${customWishlistSection}
PLOT SPECIFICATIONS:
- Dimensions: ${data.plot.width} ft width x ${data.plot.length} ft length (Total area: ${plotArea} sq ft)
- Facing direction: ${data.plot.facing} (Adhere strictly to Indian Vastu principles: Mandir/Pooja in North-East, Kitchen in South-East/North-West, Master Bed in South-West)
- City: ${data.plot.city}, ${data.plot.state}
- Development Authority: ${rules.authorityName} (${rules.authorityCode})

MANDATORY REGULATORY SETBACKS & BYLAWS:
- Required Front Setback: Min ${setbacks.frontMinFt} ft
- Required Rear Setback: Min ${setbacks.rearMinFt} ft
- Required Side Setback: Min ${setbacks.sideMinFt} ft
- Permissible Ground Coverage: Max ${rules.maxGroundCoveragePercent}%
- Permissible FAR: Max ${rules.maxFAR}

CLIENT REQUIREMENTS:
- Number of floors: ${data.requirements.floors} floors (Generate exactly ${data.requirements.floors} distinct floor levels in the 'floors' array: Level 0 = Ground Floor, Level 1 = First Floor, etc.)
- Bedrooms: ${data.requirements.bedrooms} total across floors
- Bathrooms: ${data.requirements.bathrooms} total across floors
- Kitchen: ${data.requirements.kitchenType}
- Parking: ${data.requirements.parkingSpots} car(s)
- Pooja Room: ${data.requirements.hasPoojaRoom ? 'Yes (mandir in North-East corner)' : 'No'}
- Architectural Style: ${data.preferences.style}
- Target Budget: ${data.budget.range} (${data.budget.qualityTier} finish)

ARCHITECTURAL RULES FOR EACH FLOOR:
1. Provide a realistic layout with clear circulation: Foyer/Porch, Drawing/Living, Dining, Kitchen, Bedrooms with attached Bathrooms, Powder Room, Balconies, and Staircase.
2. PRACTICAL ROOM SIZES (MANDATORY): Any bedroom or living room MUST have a minimum width of 9'-0" to 14'-0". NEVER create narrow 4ft or 5ft wide bedrooms.
3. STAIRCASE & CIRCULATION: Central stair lobby must be horizontally oriented to differentiate front and back wings (min 7ft wide), never dividing the width into narrow vertical strips.
4. Every room must have non-overlapping coordinates (x, y, width, length in feet) fitting strictly inside the buildable plot envelope after setbacks.
5. Every room must include realistic 'doors' (wall: 'top'|'bottom'|'left'|'right', offset, width) and 'windows' (wall, offset, width).
6. Return a complete, dimensionally accurate plan in strict JSON.`;
}
