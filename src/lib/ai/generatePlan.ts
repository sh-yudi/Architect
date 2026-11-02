import { WizardFormData } from '@/types/wizard';
import { HousePlan, FloorPlan, Room, Door, Window } from '@/types/plan';
import { housePlanZodSchema } from '../schemas/housePlanSchema';
import { getRegulatoryRules } from '../regulatory/engine';
import { buildHousePlanPrompt } from './promptBuilder';
import { calculateDetailedBOQ } from '../rates/calculator';

interface LayoutConfig {
  plotWidth: number;
  plotLength: number;
  buildableWidth: number;
  buildableLength: number;
  originX: number;
  originY: number;
  floorsCount: number;
  bedroomsCount: number;
  bathroomsCount: number;
  hasPooja: boolean;
  hasParking: boolean;
  hasTerrace: boolean;
  hasBasement: boolean;
  wishlist: string;
}

function generateDynamicArchitecturalFloors(config: LayoutConfig): FloorPlan[] {
  const {
    buildableWidth,
    buildableLength,
    originX,
    originY,
    floorsCount,
    hasPooja,
    hasParking,
    wishlist,
  } = config;

  const floors: FloorPlan[] = [];
  const lowerWish = wishlist.toLowerCase();

  // Dimensions subdivision
  // Grid layout: divide buildable area into 2 or 3 longitudinal zones
  const leftColWidth = Math.max(Math.floor(buildableWidth * 0.48), 10);
  const rightColWidth = Math.max(buildableWidth - leftColWidth, 10);

  const frontZoneLength = Math.max(Math.floor(buildableLength * 0.36), 12);
  const midZoneLength = Math.max(Math.floor(buildableLength * 0.32), 10);
  const rearZoneLength = Math.max(buildableLength - frontZoneLength - midZoneLength, 10);

  // 1. BASEMENT (If requested or mentioned in wishlist)
  if (config.hasBasement || lowerWish.includes('basement')) {
    const basementRooms: Room[] = [
      {
        id: 'b-1',
        name: 'Home Theater & Media Lounge',
        x: originX,
        y: originY,
        width: leftColWidth,
        length: frontZoneLength + midZoneLength,
        doors: [{ id: 'bd-1', wall: 'right', offset: 4, width: 3.0 }],
        windows: [],
      },
      {
        id: 'b-2',
        name: 'Recreational Gym & Billiards Hall',
        x: originX + leftColWidth,
        y: originY,
        width: rightColWidth,
        length: frontZoneLength + midZoneLength,
        doors: [{ id: 'bd-2', wall: 'left', offset: 4, width: 3.0 }],
        windows: [],
      },
      {
        id: 'b-3',
        name: 'Storage & Mechanical Room',
        x: originX,
        y: originY + frontZoneLength + midZoneLength,
        width: Math.floor(buildableWidth * 0.5),
        length: rearZoneLength,
        doors: [{ id: 'bd-3', wall: 'top', offset: 2, width: 2.5 }],
        windows: [],
      },
      {
        id: 'b-4',
        name: 'Basement Powder Toilet',
        x: originX + Math.floor(buildableWidth * 0.5),
        y: originY + frontZoneLength + midZoneLength,
        width: buildableWidth - Math.floor(buildableWidth * 0.5),
        length: rearZoneLength,
        doors: [{ id: 'bd-4', wall: 'top', offset: 2, width: 2.5 }],
        windows: [],
      },
    ];
    floors.push({ level: -1, floorName: 'Basement Floor Plan', rooms: basementRooms });
  }

  // 2. GROUND FLOOR (Level 0)
  const groundRooms: Room[] = [];

  // Front zone: Porch/Parking + Entry Foyer & Drawing/Living
  if (hasParking || config.plotWidth >= 25) {
    const porchWidth = Math.min(Math.max(Math.floor(buildableWidth * 0.42), 9), 14);
    const livingWidth = buildableWidth - porchWidth;

    groundRooms.push({
      id: 'g-porch',
      name: 'Covered Car Porch & Portico',
      x: originX,
      y: originY,
      width: porchWidth,
      length: frontZoneLength,
      doors: [{ id: 'gd-porch', wall: 'right', offset: 3, width: 3.5 }],
      windows: [],
    });

    groundRooms.push({
      id: 'g-drawing',
      name: 'Drawing Room & Foyer',
      x: originX + porchWidth,
      y: originY,
      width: livingWidth,
      length: frontZoneLength,
      doors: [
        { id: 'gd-main', wall: 'bottom', offset: 2, width: 3.5 },
        { id: 'gd-draw-in', wall: 'bottom', offset: Math.floor(livingWidth * 0.5), width: 3.5 },
      ],
      windows: [
        { id: 'gw-front', wall: 'top', offset: 3, width: 5.0 },
        { id: 'gw-side-draw', wall: 'right', offset: 4, width: 4.5 },
      ],
    });
  } else {
    groundRooms.push({
      id: 'g-living',
      name: 'Formal Drawing & Living Room',
      x: originX,
      y: originY,
      width: buildableWidth,
      length: frontZoneLength,
      doors: [{ id: 'gd-main', wall: 'bottom', offset: 4, width: 3.5 }],
      windows: [{ id: 'gw-front', wall: 'top', offset: 4, width: 6.0 }],
    });
  }

  // Mid zone: Dining Hall + Modular Kitchen + Pooja + Staircase
  const kitchenWidth = Math.max(Math.floor(buildableWidth * 0.38), 9);
  const poojaWidth = hasPooja ? Math.min(Math.max(Math.floor(buildableWidth * 0.2), 5), 7) : 0;
  const diningWidth = buildableWidth - kitchenWidth - poojaWidth;

  groundRooms.push({
    id: 'g-dining',
    name: 'Central Dining Hall',
    x: originX,
    y: originY + frontZoneLength,
    width: diningWidth,
    length: midZoneLength,
    doors: [{ id: 'gd-dining', wall: 'right', offset: 2, width: 3.0 }],
    windows: [{ id: 'gw-dining', wall: 'left', offset: 3, width: 4.0 }],
  });

  groundRooms.push({
    id: 'g-kitchen',
    name: 'Modular Kitchen & Pantry',
    x: originX + diningWidth,
    y: originY + frontZoneLength,
    width: kitchenWidth,
    length: midZoneLength,
    doors: [{ id: 'gd-kitchen', wall: 'left', offset: 2, width: 3.0 }],
    windows: [{ id: 'gw-kitchen', wall: 'right', offset: 2, width: 4.0 }],
  });

  if (hasPooja) {
    groundRooms.push({
      id: 'g-pooja',
      name: 'Pooja Room (Mandir)',
      x: originX + diningWidth + kitchenWidth,
      y: originY + frontZoneLength,
      width: poojaWidth,
      length: midZoneLength,
      doors: [{ id: 'gd-pooja', wall: 'left', offset: 1.5, width: 2.5 }],
      windows: [{ id: 'gw-pooja', wall: 'top', offset: 1.5, width: 2.5 }],
    });
  }

  // Rear zone: Ground Floor Bedroom + Attached Bath + Common Toilet + Staircase Lobby
  const stairWidth = Math.min(Math.max(Math.floor(buildableWidth * 0.28), 7), 9);
  const bathWidth = Math.min(Math.max(Math.floor(buildableWidth * 0.22), 5), 7);
  const bedWidth = buildableWidth - stairWidth - bathWidth;

  groundRooms.push({
    id: 'g-bed1',
    name: 'Ground Bedroom (Guest/Parents)',
    x: originX,
    y: originY + frontZoneLength + midZoneLength,
    width: bedWidth,
    length: rearZoneLength,
    doors: [{ id: 'gd-bed1', wall: 'top', offset: 2, width: 3.0 }],
    windows: [{ id: 'gw-bed1', wall: 'bottom', offset: 3, width: 4.0 }],
  });

  groundRooms.push({
    id: 'g-bath1',
    name: 'Attached Bathroom & Toilet',
    x: originX + bedWidth,
    y: originY + frontZoneLength + midZoneLength,
    width: bathWidth,
    length: rearZoneLength,
    doors: [{ id: 'gd-bath1', wall: 'left', offset: 2, width: 2.5 }],
    windows: [{ id: 'gw-bath1', wall: 'bottom', offset: 1.5, width: 2.5 }],
  });

  groundRooms.push({
    id: 'g-stair',
    name: 'Staircase Lobby & Powder Room',
    x: originX + bedWidth + bathWidth,
    y: originY + frontZoneLength + midZoneLength,
    width: stairWidth,
    length: rearZoneLength,
    doors: [{ id: 'gd-stair', wall: 'top', offset: 1.5, width: 3.0 }],
    windows: [{ id: 'gw-stair', wall: 'right', offset: 2, width: 3.0 }],
  });

  floors.push({ level: 0, floorName: 'Ground Floor Plan', rooms: groundRooms });

  // 3. FIRST FLOOR (If floors >= 2)
  if (floorsCount >= 2) {
    const firstRooms: Room[] = [
      {
        id: 'f-master',
        name: 'Master Bedroom Suite',
        x: originX,
        y: originY,
        width: Math.floor(buildableWidth * 0.58),
        length: frontZoneLength,
        doors: [{ id: 'fd-master', wall: 'bottom', offset: 3, width: 3.0 }],
        windows: [
          { id: 'fw-master-f', wall: 'top', offset: 3, width: 5.0 },
          { id: 'fw-master-s', wall: 'left', offset: 3, width: 4.0 },
        ],
      },
      {
        id: 'f-balcony',
        name: 'Front Sit-out Balcony',
        x: originX + Math.floor(buildableWidth * 0.58),
        y: originY,
        width: buildableWidth - Math.floor(buildableWidth * 0.58),
        length: Math.max(Math.floor(frontZoneLength * 0.5), 6),
        doors: [{ id: 'fd-balc', wall: 'left', offset: 1.5, width: 3.0 }],
        windows: [],
      },
      {
        id: 'f-mbath',
        name: 'Walk-in Dress & Master Bath',
        x: originX + Math.floor(buildableWidth * 0.58),
        y: originY + Math.max(Math.floor(frontZoneLength * 0.5), 6),
        width: buildableWidth - Math.floor(buildableWidth * 0.58),
        length: frontZoneLength - Math.max(Math.floor(frontZoneLength * 0.5), 6),
        doors: [{ id: 'fd-mbath', wall: 'left', offset: 2, width: 2.5 }],
        windows: [{ id: 'fw-mbath', wall: 'right', offset: 2, width: 3.0 }],
      },
      {
        id: 'f-lounge',
        name: 'Family Lounge & TV Lobby',
        x: originX,
        y: originY + frontZoneLength,
        width: Math.floor(buildableWidth * 0.6),
        length: midZoneLength,
        doors: [{ id: 'fd-lounge', wall: 'right', offset: 2, width: 3.0 }],
        windows: [{ id: 'fw-lounge', wall: 'left', offset: 2, width: 4.0 }],
      },
      {
        id: 'f-bed2',
        name: "Kids' / Children Bedroom",
        x: originX + Math.floor(buildableWidth * 0.6),
        y: originY + frontZoneLength,
        width: buildableWidth - Math.floor(buildableWidth * 0.6),
        length: midZoneLength,
        doors: [{ id: 'fd-bed2', wall: 'left', offset: 2, width: 3.0 }],
        windows: [{ id: 'fw-bed2', wall: 'right', offset: 3, width: 4.0 }],
      },
      {
        id: 'f-bed3',
        name: 'Bedroom 3 (Guest Suite)',
        x: originX,
        y: originY + frontZoneLength + midZoneLength,
        width: Math.floor(buildableWidth * 0.5),
        length: rearZoneLength,
        doors: [{ id: 'fd-bed3', wall: 'top', offset: 2, width: 3.0 }],
        windows: [{ id: 'fw-bed3', wall: 'bottom', offset: 3, width: 4.0 }],
      },
      {
        id: 'f-bath2',
        name: 'Attached Bathroom & Toilet',
        x: originX + Math.floor(buildableWidth * 0.5),
        y: originY + frontZoneLength + midZoneLength,
        width: Math.floor(buildableWidth * 0.25),
        length: rearZoneLength,
        doors: [{ id: 'fd-bath2', wall: 'left', offset: 2, width: 2.5 }],
        windows: [{ id: 'fw-bath2', wall: 'bottom', offset: 1.5, width: 2.5 }],
      },
      {
        id: 'f-stair',
        name: 'Staircase Core',
        x: originX + Math.floor(buildableWidth * 0.75),
        y: originY + frontZoneLength + midZoneLength,
        width: buildableWidth - Math.floor(buildableWidth * 0.75),
        length: rearZoneLength,
        doors: [{ id: 'fd-stair', wall: 'top', offset: 1.5, width: 3.0 }],
        windows: [{ id: 'fw-stair', wall: 'right', offset: 2, width: 3.0 }],
      },
    ];
    floors.push({ level: 1, floorName: 'First Floor Plan', rooms: firstRooms });
  }

  // 4. SECOND FLOOR (If floors >= 3)
  if (floorsCount >= 3) {
    const secondRooms: Room[] = [
      {
        id: 's-office',
        name: lowerWish.includes('gym') ? 'Fitness Gym & Yoga Room' : 'Executive Study & Home Office',
        x: originX,
        y: originY,
        width: Math.floor(buildableWidth * 0.55),
        length: frontZoneLength,
        doors: [{ id: 'sd-off', wall: 'bottom', offset: 3, width: 3.0 }],
        windows: [{ id: 'sw-off', wall: 'top', offset: 3, width: 5.0 }],
      },
      {
        id: 's-terrace',
        name: 'Open Sky Terrace Garden',
        x: originX + Math.floor(buildableWidth * 0.55),
        y: originY,
        width: buildableWidth - Math.floor(buildableWidth * 0.55),
        length: frontZoneLength + midZoneLength,
        doors: [{ id: 'sd-terrace', wall: 'left', offset: 4, width: 3.0 }],
        windows: [],
      },
      {
        id: 's-bed4',
        name: 'Guest Penthouse Bedroom',
        x: originX,
        y: originY + frontZoneLength,
        width: Math.floor(buildableWidth * 0.55),
        length: midZoneLength,
        doors: [{ id: 'sd-bed4', wall: 'top', offset: 2, width: 3.0 }],
        windows: [{ id: 'sw-bed4', wall: 'left', offset: 2, width: 4.0 }],
      },
      {
        id: 's-bath3',
        name: 'Terrace Bathroom & Powder',
        x: originX,
        y: originY + frontZoneLength + midZoneLength,
        width: Math.floor(buildableWidth * 0.35),
        length: rearZoneLength,
        doors: [{ id: 'sd-bath3', wall: 'top', offset: 2, width: 2.5 }],
        windows: [{ id: 'sw-bath3', wall: 'bottom', offset: 1.5, width: 2.5 }],
      },
      {
        id: 's-lounge',
        name: 'Pantry & Bar Counter',
        x: originX + Math.floor(buildableWidth * 0.35),
        y: originY + frontZoneLength + midZoneLength,
        width: Math.floor(buildableWidth * 0.35),
        length: rearZoneLength,
        doors: [{ id: 'sd-bar', wall: 'top', offset: 2, width: 2.5 }],
        windows: [{ id: 'sw-bar', wall: 'bottom', offset: 1.5, width: 3.0 }],
      },
      {
        id: 's-stair',
        name: 'Staircase Mumty & Overhead Tank',
        x: originX + Math.floor(buildableWidth * 0.7),
        y: originY + frontZoneLength + midZoneLength,
        width: buildableWidth - Math.floor(buildableWidth * 0.7),
        length: rearZoneLength,
        doors: [{ id: 'sd-stair', wall: 'top', offset: 1.5, width: 3.0 }],
        windows: [{ id: 'sw-stair', wall: 'right', offset: 2, width: 3.0 }],
      },
    ];
    floors.push({ level: 2, floorName: 'Second Floor Plan', rooms: secondRooms });
  }

  // 5. ADDITIONAL FLOORS (If floors >= 4)
  for (let lvl = 3; lvl < floorsCount; lvl++) {
    const nthRooms: Room[] = [
      {
        id: `f${lvl}-suite`,
        name: `Floor ${lvl} Master Apartment Suite`,
        x: originX,
        y: originY,
        width: Math.floor(buildableWidth * 0.6),
        length: frontZoneLength + midZoneLength,
        doors: [{ id: `f${lvl}-d1`, wall: 'right', offset: 4, width: 3.0 }],
        windows: [{ id: `f${lvl}-w1`, wall: 'top', offset: 3, width: 5.0 }],
      },
      {
        id: `f${lvl}-balc`,
        name: `Floor ${lvl} Panoramic Balcony`,
        x: originX + Math.floor(buildableWidth * 0.6),
        y: originY,
        width: buildableWidth - Math.floor(buildableWidth * 0.6),
        length: Math.max(Math.floor(frontZoneLength * 0.6), 6),
        doors: [{ id: `f${lvl}-d2`, wall: 'left', offset: 2, width: 3.0 }],
        windows: [],
      },
      {
        id: `f${lvl}-bath`,
        name: `Floor ${lvl} Attached Bathroom`,
        x: originX + Math.floor(buildableWidth * 0.6),
        y: originY + Math.max(Math.floor(frontZoneLength * 0.6), 6),
        width: buildableWidth - Math.floor(buildableWidth * 0.6),
        length: frontZoneLength + midZoneLength - Math.max(Math.floor(frontZoneLength * 0.6), 6),
        doors: [{ id: `f${lvl}-d3`, wall: 'left', offset: 2, width: 2.5 }],
        windows: [{ id: `f${lvl}-w2`, wall: 'right', offset: 2, width: 3.0 }],
      },
      {
        id: `f${lvl}-lounge`,
        name: `Floor ${lvl} Multi-Purpose Living & Dining`,
        x: originX,
        y: originY + frontZoneLength + midZoneLength,
        width: Math.floor(buildableWidth * 0.65),
        length: rearZoneLength,
        doors: [{ id: `f${lvl}-d4`, wall: 'top', offset: 3, width: 3.0 }],
        windows: [{ id: `f${lvl}-w3`, wall: 'bottom', offset: 3, width: 4.0 }],
      },
      {
        id: `f${lvl}-stair`,
        name: 'Staircase Tower',
        x: originX + Math.floor(buildableWidth * 0.65),
        y: originY + frontZoneLength + midZoneLength,
        width: buildableWidth - Math.floor(buildableWidth * 0.65),
        length: rearZoneLength,
        doors: [{ id: `f${lvl}-d5`, wall: 'top', offset: 1.5, width: 3.0 }],
        windows: [{ id: `f${lvl}-w4`, wall: 'right', offset: 2, width: 3.0 }],
      },
    ];
    floors.push({
      level: lvl,
      floorName: lvl === floorsCount - 1 ? `Top Floor (Level ${lvl})` : `Upper Floor (Level ${lvl})`,
      rooms: nthRooms,
    });
  }

  return floors;
}

export async function generateHousePlan(formData: WizardFormData, apiKey?: string): Promise<HousePlan> {
  const rules = getRegulatoryRules(formData.regulatory.authorityName || 'GDA');
  const prompt = buildHousePlanPrompt(formData, rules);
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (key) {
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: key });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plot: {
                type: Type.OBJECT,
                properties: {
                  width: { type: Type.NUMBER },
                  length: { type: Type.NUMBER },
                  facing: { type: Type.STRING },
                  area: { type: Type.NUMBER },
                },
                required: ['width', 'length', 'facing', 'area'],
              },
              setbacks: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.NUMBER },
                  rear: { type: Type.NUMBER },
                  left: { type: Type.NUMBER },
                  right: { type: Type.NUMBER },
                },
                required: ['front', 'rear', 'left', 'right'],
              },
              floors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.INTEGER },
                    floorName: { type: Type.STRING },
                    rooms: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          x: { type: Type.NUMBER },
                          y: { type: Type.NUMBER },
                          width: { type: Type.NUMBER },
                          length: { type: Type.NUMBER },
                        },
                        required: ['id', 'name', 'x', 'y', 'width', 'length'],
                      },
                    },
                  },
                  required: ['level', 'floorName', 'rooms'],
                },
              },
              facade: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING },
                  features: { type: Type.ARRAY, items: { type: Type.STRING } },
                  exteriorMaterial: { type: Type.STRING },
                },
                required: ['style', 'features', 'exteriorMaterial'],
              },
            },
            required: ['plot', 'setbacks', 'floors', 'facade'],
          },
        },
      });

      if (response.text) {
        const rawJson = JSON.parse(response.text);
        const plotArea = formData.plot.width * formData.plot.length;
        const builtUpArea = plotArea * formData.requirements.floors * 0.75;
        const boq = calculateDetailedBOQ(builtUpArea, formData.plot.city, formData.budget.qualityTier);

        const parsedFloors = (rawJson.floors || []).map((f: any, idx: number) => ({
          level: f.level ?? idx,
          floorName: f.floorName ?? `Level ${idx}`,
          rooms: (f.rooms || []).map((r: any, rIdx: number) => ({
            id: r.id || `r-${idx}-${rIdx}`,
            name: r.name || 'Room',
            x: Math.max(Number(r.x) || 0, 0),
            y: Math.max(Number(r.y) || 0, 0),
            width: Math.max(Number(r.width) || 12, 4),
            length: Math.max(Number(r.length) || 12, 4),
            doors: Array.isArray(r.doors) ? r.doors : [{ id: `d-${idx}-${rIdx}`, wall: 'bottom' as const, offset: 2, width: 3 }],
            windows: Array.isArray(r.windows) ? r.windows : [{ id: `w-${idx}-${rIdx}`, wall: 'top' as const, offset: 3, width: 4 }],
          })),
        }));

        const groundFloor = parsedFloors.find((f: any) => f.level === 0) || parsedFloors[0];
        const groundRoomsArea = (groundFloor?.rooms || []).reduce(
          (sum: number, r: any) => sum + (r.width * r.length),
          0
        );
        const groundCoverage = Math.max(
          Math.min(Number(((groundRoomsArea / plotArea) * 100).toFixed(1)), 85),
          10
        );

        const allRooms = parsedFloors.flatMap((f: any) => f.rooms);

        const mergedPlan: HousePlan = {
          customWishlist: formData.customWishlist || '',
          plot: {
            width: formData.plot.width,
            length: formData.plot.length,
            facing: formData.plot.facing,
            area: plotArea,
          },
          setbacks: rawJson.setbacks || { front: 10, rear: 6.5, left: 3, right: 3 },
          floors: parsedFloors,
          structural: {
            columns: [
              { id: 'c1', x: 0, y: 0, sizeInches: [9, 12] },
              { id: 'c2', x: formData.plot.width, y: 0, sizeInches: [9, 12] },
              { id: 'c3', x: 0, y: formData.plot.length, sizeInches: [9, 12] },
              { id: 'c4', x: formData.plot.width, y: formData.plot.length, sizeInches: [9, 12] },
            ],
            beams: [{ id: 'b1', startColumnId: 'c1', endColumnId: 'c2' }],
            footingType: 'Isolated RCC Column Footing (5ft depth)',
            slabType: 'M25 Reinforced Concrete 5.5-inch Slab',
          },
          electrical: {
            pointsByRoom: allRooms.map((r: any) => ({
              roomId: r.id,
              lightPoints: 4,
              fanPoints: 2,
              powerSockets: 4,
            })),
          },
          plumbing: {
            inletPoints: [{ x: 5, y: 5, type: 'Municipal Fresh Supply (1-inch GI Line)' }],
            outletPoints: [{ x: 5, y: formData.plot.length, type: 'Inspection Chamber Connection (4-inch PVC)' }],
          },
          budget: boq,
          facade: {
            style: formData.preferences.style,
            features: rawJson.facade?.features || [
              'Modern Balcony Toughened Glass Railing',
              'Double Height Grand Entryway with Granite Cladding',
              'Louvered Exterior Panels for Sun Shading',
            ],
            exteriorMaterial: rawJson.facade?.exteriorMaterial || 'Textured Weather-Shield Plaster with Stone Accents',
          },
          regulatory: {
            far: Math.max(Number((builtUpArea / plotArea).toFixed(2)), 0.1),
            groundCoverage,
            builtUpArea,
            violations: [],
          },
        };

        const validated = housePlanZodSchema.safeParse(mergedPlan);
        if (validated.success) {
          return validated.data as HousePlan;
        } else {
          console.warn('Gemini plan validation failed:', validated.error.flatten());
        }
      }
    } catch (e) {
      console.warn('Gemini live call fallback to deterministic plan engine:', e);
    }
  }

  // Dynamic architectural blueprint generation fallback
  const plotArea = formData.plot.width * formData.plot.length;
  const setbacks = rules.getSetbacksForPlot(plotArea);
  const buildableWidth = Math.max(formData.plot.width - (setbacks.sideMinFt * 2), 12);
  const buildableLength = Math.max(formData.plot.length - setbacks.frontMinFt - setbacks.rearMinFt, 16);
  const builtUpAreaPerFloor = Math.max(Math.round(buildableWidth * buildableLength), 100);
  const totalBuiltUpArea = builtUpAreaPerFloor * Math.max(formData.requirements.floors, 1);
  const boq = calculateDetailedBOQ(totalBuiltUpArea, formData.plot.city, formData.budget.qualityTier);

  const floors = generateDynamicArchitecturalFloors({
    plotWidth: formData.plot.width,
    plotLength: formData.plot.length,
    buildableWidth,
    buildableLength,
    originX: setbacks.sideMinFt,
    originY: setbacks.frontMinFt,
    floorsCount: Math.max(formData.requirements.floors, 1),
    bedroomsCount: formData.requirements.bedrooms,
    bathroomsCount: formData.requirements.bathrooms,
    hasPooja: formData.requirements.hasPoojaRoom,
    hasParking: formData.requirements.parkingSpots > 0,
    hasTerrace: formData.requirements.hasTerrace,
    hasBasement: formData.requirements.hasBasement,
    wishlist: formData.customWishlist || '',
  });

  const allRooms = floors.flatMap((f) => f.rooms);

  const generatedPlan: HousePlan = {
    customWishlist: formData.customWishlist || '',
    plot: {
      width: formData.plot.width,
      length: formData.plot.length,
      facing: formData.plot.facing,
      area: plotArea,
    },
    setbacks: {
      front: setbacks.frontMinFt,
      rear: setbacks.rearMinFt,
      left: setbacks.sideMinFt,
      right: setbacks.sideMinFt,
    },
    floors,
    structural: {
      columns: [
        { id: 'c1', x: setbacks.sideMinFt, y: setbacks.frontMinFt, sizeInches: [9, 12] },
        { id: 'c2', x: setbacks.sideMinFt + Math.floor(buildableWidth / 2), y: setbacks.frontMinFt, sizeInches: [9, 12] },
        { id: 'c3', x: setbacks.sideMinFt + buildableWidth, y: setbacks.frontMinFt, sizeInches: [9, 12] },
        { id: 'c4', x: setbacks.sideMinFt, y: setbacks.frontMinFt + Math.floor(buildableLength / 2), sizeInches: [9, 12] },
        { id: 'c5', x: setbacks.sideMinFt + buildableWidth, y: setbacks.frontMinFt + Math.floor(buildableLength / 2), sizeInches: [9, 12] },
        { id: 'c6', x: setbacks.sideMinFt, y: setbacks.frontMinFt + buildableLength, sizeInches: [9, 12] },
        { id: 'c7', x: setbacks.sideMinFt + Math.floor(buildableWidth / 2), y: setbacks.frontMinFt + buildableLength, sizeInches: [9, 12] },
        { id: 'c8', x: setbacks.sideMinFt + buildableWidth, y: setbacks.frontMinFt + buildableLength, sizeInches: [9, 12] },
      ],
      beams: [
        { id: 'b1', startColumnId: 'c1', endColumnId: 'c3' },
        { id: 'b2', startColumnId: 'c4', endColumnId: 'c5' },
        { id: 'b3', startColumnId: 'c6', endColumnId: 'c8' },
      ],
      footingType: 'Isolated RCC Pad Footing (4.5ft depth below NGL)',
      slabType: 'M25 Reinforced Concrete 5-inch Slab with Fe500D TMT',
    },
    electrical: {
      pointsByRoom: allRooms.map((r) => ({
        roomId: r.id,
        lightPoints: Math.max(Math.floor((r.width * r.length) / 50), 2),
        fanPoints: r.name.toLowerCase().includes('bath') ? 0 : 1,
        powerSockets: Math.max(Math.floor((r.width * r.length) / 60), 2),
      })),
    },
    plumbing: {
      inletPoints: [
        { x: setbacks.sideMinFt + 2, y: setbacks.frontMinFt + Math.floor(buildableLength * 0.4), type: 'Municipal Fresh Water Inlet' },
        { x: setbacks.sideMinFt + 4, y: setbacks.frontMinFt + Math.floor(buildableLength * 0.8), type: 'Overhead Tank Gravity Supply' },
      ],
      outletPoints: [
        { x: setbacks.sideMinFt, y: formData.plot.length, type: 'Main Sewer Gully Trap' },
        { x: formData.plot.width - setbacks.sideMinFt, y: formData.plot.length, type: 'Storm Water Drain Line' },
      ],
    },
    budget: boq,
    facade: {
      style: formData.preferences.style,
      features: [
        'Contemporary Balcony Glass Railing with MS Balusters',
        'Large Louvered Ventilation Windows for Cross-Breeze',
        'Texture Painted Parapet Band with Weather-Shield Coating',
        'Granite Tiled Main Portico Entrance',
      ],
      exteriorMaterial: 'Double-coat plaster with silicone exterior emulsion & stone highlights',
    },
    regulatory: {
      far: Math.max(Number((totalBuiltUpArea / plotArea).toFixed(2)), 0.1),
      groundCoverage: Math.max(Number(((builtUpAreaPerFloor / plotArea) * 100).toFixed(1)), 1),
      builtUpArea: totalBuiltUpArea,
      violations: [],
    },
  };

  return housePlanZodSchema.parse(generatedPlan) as HousePlan;
}
