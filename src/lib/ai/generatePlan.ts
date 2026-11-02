import { WizardFormData } from '@/types/wizard';
import { HousePlan } from '@/types/plan';
import { housePlanZodSchema } from '../schemas/housePlanSchema';
import { getRegulatoryRules } from '../regulatory/engine';
import { buildHousePlanPrompt } from './promptBuilder';
import { calculateDetailedBOQ } from '../rates/calculator';
import { DEFAULT_GEMINI_MODEL, getGeminiApiKey } from './geminiClient';

export async function generateHousePlan(formData: WizardFormData, apiKey?: string): Promise<HousePlan> {
  const rules = getRegulatoryRules(formData.regulatory.authorityName || 'GDA');
  const prompt = buildHousePlanPrompt(formData, rules);
  const key = getGeminiApiKey(apiKey);

  if (key) {
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: key });

      const planSchema = {
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
      };

      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: planSchema as any,
          ...({ responseJsonSchema: planSchema } as any),
        },
      });

      if (response?.text) {
        const rawJson = JSON.parse(response.text);
        const builtUpArea = formData.plot.width * formData.plot.length * formData.requirements.floors * 0.75;
        const boq = calculateDetailedBOQ(builtUpArea, formData.plot.city, formData.budget.qualityTier);

        const mappedFloors = (rawJson.floors || []).map((f: any, idx: number) => ({
          level: f.level ?? idx,
          floorName: f.floorName ?? `Level ${idx}`,
          rooms: (f.rooms || []).map((r: any, rIdx: number) => ({
            id: r.id || `r-${idx}-${rIdx}`,
            name: r.name || 'Room',
            x: Math.max(0, Number(r.x) || 0),
            y: Math.max(0, Number(r.y) || 0),
            width: Math.max(1, Number(r.width) || 12),
            length: Math.max(1, Number(r.length) || 12),
            doors: r.doors || [],
            windows: r.windows || [],
          })),
        }));

        const allRooms = mappedFloors.flatMap((f: any) => f.rooms);
        const pointsByRoom = allRooms.length > 0
          ? allRooms.map((r: any) => ({
              roomId: r.id,
              lightPoints: 4,
              fanPoints: 2,
              powerSockets: 4,
            }))
          : [{ roomId: 'r1', lightPoints: 4, fanPoints: 2, powerSockets: 4 }];

        const plotArea = formData.plot.width * formData.plot.length;
        const groundFloor = mappedFloors.find((f: any) => f.level === 0) || mappedFloors[0];
        const groundFloorRoomsArea = groundFloor
          ? groundFloor.rooms.reduce((acc: number, r: any) => acc + (r.width * r.length), 0)
          : builtUpArea;
        const groundCoverage = Number(((groundFloorRoomsArea / plotArea) * 100).toFixed(1));

        const mergedPlan: HousePlan = {
          plot: {
            width: formData.plot.width,
            length: formData.plot.length,
            facing: formData.plot.facing,
            area: plotArea,
          },
          setbacks: rawJson.setbacks || { front: 10, rear: 6.5, left: 3, right: 3 },
          floors: mappedFloors,
          structural: {
            columns: [
              { id: 'c1', x: 0, y: 0, sizeInches: [9, 12] },
              { id: 'c2', x: formData.plot.width, y: 0, sizeInches: [9, 12] },
              { id: 'c3', x: 0, y: formData.plot.length, sizeInches: [9, 12] },
              { id: 'c4', x: formData.plot.width, y: formData.plot.length, sizeInches: [9, 12] },
            ],
            beams: [{ id: 'b1', startColumnId: 'c1', endColumnId: 'c2' }],
            footingType: 'Isolated RCC Column Footing',
            slabType: 'M20 Grade 5-inch RCC Slab',
          },
          electrical: {
            pointsByRoom,
          },
          plumbing: {
            inletPoints: [{ x: 5, y: 5, type: 'Municipal Fresh Supply' }],
            outletPoints: [{ x: 5, y: formData.plot.length, type: 'Inspection Chamber Connection' }],
          },
          budget: boq,
          facade: {
            style: formData.preferences.style,
            features: rawJson.facade?.features || ['Modern Balcony Glass Railing', 'Double Height Entryway'],
            exteriorMaterial: rawJson.facade?.exteriorMaterial || 'Textured Weather-Shield Plaster',
          },
          regulatory: {
            far: Number((builtUpArea / plotArea).toFixed(2)),
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

  // Deterministic architectural blueprint generation fallback
  const plotArea = formData.plot.width * formData.plot.length;
  const setbacks = rules.getSetbacksForPlot(plotArea);
  const buildableWidth = Math.max(formData.plot.width - (setbacks.sideMinFt * 2), 10);
  const buildableLength = Math.max(formData.plot.length - setbacks.frontMinFt - setbacks.rearMinFt, 10);
  const builtUpAreaPerFloor = Math.max(Math.round(buildableWidth * buildableLength), 100);
  const totalBuiltUpArea = builtUpAreaPerFloor * Math.max(formData.requirements.floors, 1);
  const boq = calculateDetailedBOQ(totalBuiltUpArea, formData.plot.city, formData.budget.qualityTier);

  const halfWidth = Math.max(Math.floor(buildableWidth / 2), 5);
  const halfLength = Math.max(Math.floor(buildableLength / 2), 5);

  const groundRooms = [
    {
      id: 'g-1',
      name: 'Living & Dining Hall',
      x: setbacks.sideMinFt,
      y: setbacks.frontMinFt,
      width: buildableWidth,
      length: halfLength,
      doors: [{ id: 'd1', wall: 'bottom' as const, offset: 2, width: 3.5 }],
      windows: [{ id: 'w1', wall: 'top' as const, offset: 4, width: 5 }],
    },
    {
      id: 'g-2',
      name: 'Kitchen',
      x: setbacks.sideMinFt,
      y: setbacks.frontMinFt + halfLength,
      width: halfWidth,
      length: halfLength,
      doors: [{ id: 'd2', wall: 'top' as const, offset: 1, width: 3 }],
      windows: [{ id: 'w2', wall: 'left' as const, offset: 2, width: 4 }],
    },
    {
      id: 'g-3',
      name: 'Master Bedroom',
      x: setbacks.sideMinFt + halfWidth,
      y: setbacks.frontMinFt + halfLength,
      width: halfWidth,
      length: halfLength,
      doors: [{ id: 'd3', wall: 'top' as const, offset: 1, width: 3 }],
      windows: [{ id: 'w3', wall: 'right' as const, offset: 2, width: 4 }],
    },
  ];

  const firstRooms = [
    {
      id: 'f-1',
      name: 'Bedroom 2',
      x: setbacks.sideMinFt,
      y: setbacks.frontMinFt,
      width: halfWidth,
      length: halfLength,
      doors: [],
      windows: [],
    },
    {
      id: 'f-2',
      name: 'Bedroom 3',
      x: setbacks.sideMinFt + halfWidth,
      y: setbacks.frontMinFt,
      width: halfWidth,
      length: halfLength,
      doors: [],
      windows: [],
    },
    {
      id: 'f-3',
      name: 'Open Terrace / Balcony',
      x: setbacks.sideMinFt,
      y: setbacks.frontMinFt + halfLength,
      width: buildableWidth,
      length: halfLength,
      doors: [],
      windows: [],
    },
  ];

  const floors = [
    { level: 0, floorName: 'Ground Floor Plan', rooms: groundRooms },
  ];

  if (formData.requirements.floors > 1) {
    floors.push({ level: 1, floorName: 'First Floor Plan', rooms: firstRooms });
  }

  const generatedPlan: HousePlan = {
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
        { id: 'c2', x: setbacks.sideMinFt + buildableWidth, y: setbacks.frontMinFt, sizeInches: [9, 12] },
        { id: 'c3', x: setbacks.sideMinFt, y: setbacks.frontMinFt + buildableLength, sizeInches: [9, 12] },
        { id: 'c4', x: setbacks.sideMinFt + buildableWidth, y: setbacks.frontMinFt + buildableLength, sizeInches: [9, 12] },
      ],
      beams: [
        { id: 'b1', startColumnId: 'c1', endColumnId: 'c2' },
        { id: 'b2', startColumnId: 'c3', endColumnId: 'c4' },
      ],
      footingType: 'Isolated RCC Pad Footing (4ft depth)',
      slabType: 'M20 Reinforced Concrete 5-inch Slab',
    },
    electrical: {
      pointsByRoom: floors.flatMap(f => f.rooms).map(r => ({
        roomId: r.id,
        lightPoints: 3,
        fanPoints: 1,
        powerSockets: 3,
      })),
    },
    plumbing: {
      inletPoints: [{ x: setbacks.sideMinFt + 2, y: setbacks.frontMinFt + halfLength + 2, type: 'Kitchen Sink' }],
      outletPoints: [{ x: setbacks.sideMinFt, y: formData.plot.length, type: 'Gully Trap / Sewer Line' }],
    },
    budget: boq,
    facade: {
      style: formData.preferences.style,
      features: [
        'Contemporary Balcony Cantilever',
        'Large Louvered Ventilation Windows',
        'Texture Painted Parapet Band',
      ],
      exteriorMaterial: 'Double-coat plaster with silicone exterior emulsion',
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
