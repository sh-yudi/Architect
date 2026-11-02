import { describe, it, expect, vi } from 'vitest';
import { generateHousePlan } from '@/lib/ai/generatePlan';
import { buildHousePlanPrompt } from '@/lib/ai/promptBuilder';
import { getRegulatoryRules } from '@/lib/regulatory/engine';
import { WizardFormData } from '@/types/wizard';
import { housePlanZodSchema } from '@/lib/schemas/housePlanSchema';

const mockWizardData: WizardFormData = {
  plot: {
    width: 30,
    length: 40,
    shape: 'rectangular',
    facing: 'East',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    pincode: '201001',
  },
  requirements: {
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    hasLivingRoom: true,
    kitchenType: 'modular',
    parkingSpots: 1,
    hasPoojaRoom: true,
    hasServantQuarter: false,
    hasTerrace: true,
    hasBasement: false,
  },
  preferences: {
    style: 'Modern',
    garden: 'front',
    balconies: 1,
    windowType: 'large',
  },
  budget: {
    range: '25-40L',
    qualityTier: 'standard',
  },
  regulatory: {
    ownerName: 'Rajesh Sharma',
    fatherOrSpouseName: 'K. L. Sharma',
    khasraNumber: '412/2',
    khatauniNumber: '89',
    authorityName: 'GDA',
    zone: 'Zone 2',
  },
};

describe('Gemini House Plan Generator', () => {
  it('should parse and validate generated plan matching housePlan schema', async () => {
    // When no API key is set, generateHousePlan should return a deterministic valid mock plan
    const plan = await generateHousePlan(mockWizardData, undefined);
    expect(plan.plot.width).toBe(30);
    expect(plan.plot.length).toBe(40);
    expect(plan.floors.length).toBeGreaterThanOrEqual(1);
    expect(plan.budget.total).toBeGreaterThan(0);
    expect(plan.regulatory.far).toBeGreaterThan(0);
    // Electrical points mapped across all rooms on all floors
    const totalRooms = plan.floors.reduce((acc, f) => acc + f.rooms.length, 0);
    expect(plan.electrical.pointsByRoom.length).toBe(totalRooms);

    // Validate with zod schema
    const parseResult = housePlanZodSchema.safeParse(plan);
    expect(parseResult.success).toBe(true);
  });

  it('should generate architectural prompt including Vastu and setbacks', () => {
    const rules = getRegulatoryRules('GDA');
    const prompt = buildHousePlanPrompt(mockWizardData, rules);

    expect(prompt).toContain('30 ft width x 40 ft length');
    expect(prompt).toContain('1200 sq ft');
    expect(prompt).toContain('East');
    expect(prompt).toContain('Vastu');
    expect(prompt).toContain('Ghaziabad');
    expect(prompt).toContain('GDA');
    expect(prompt).toContain('Required Front Setback');
    expect(prompt).toContain('Permissible Ground Coverage');
    expect(prompt).toContain('Pooja Room');
  });

  it('should generate plan for single floor requirements', async () => {
    const singleFloorData: WizardFormData = {
      ...mockWizardData,
      requirements: {
        ...mockWizardData.requirements,
        floors: 1,
      },
    };

    const plan = await generateHousePlan(singleFloorData, undefined);
    expect(plan.floors.length).toBe(1);
    expect(plan.floors[0].floorName).toBe('Ground Floor Plan');
    expect(plan.floors[0].rooms.length).toBeGreaterThanOrEqual(3);
  });

  it('should successfully handle Gemini API structured response when API key is provided', async () => {
    const mockGeminiResponse = {
      plot: {
        width: 30,
        length: 40,
        facing: 'East',
        area: 1200,
      },
      setbacks: {
        front: 10,
        rear: 6.5,
        left: 3,
        right: 3,
      },
      floors: [
        {
          level: 0,
          floorName: 'Ground Floor',
          rooms: [
            { id: 'r1', name: 'Living Room', x: 3, y: 10, width: 14, length: 16 },
            { id: 'r2', name: 'Kitchen', x: 17, y: 10, width: 10, length: 12 },
          ],
        },
      ],
      facade: {
        style: 'Modern',
        features: ['Large Glazed Windows', 'Louvered Elevation Screen'],
        exteriorMaterial: 'Textured Stucco and Wood Panel Cladding',
      },
    };

    // Spy on dynamic import / mock GoogleGenAI
    vi.doMock('@google/genai', () => {
      return {
        Type: {
          OBJECT: 'OBJECT',
          STRING: 'STRING',
          NUMBER: 'NUMBER',
          INTEGER: 'INTEGER',
          ARRAY: 'ARRAY',
        },
        GoogleGenAI: vi.fn().mockImplementation(() => ({
          models: {
            generateContent: vi.fn().mockResolvedValue({
              text: JSON.stringify(mockGeminiResponse),
            }),
          },
        })),
      };
    });

    const plan = await generateHousePlan(mockWizardData, 'test-api-key');
    expect(plan.plot.width).toBe(30);
    expect(plan.plot.length).toBe(40);
    expect(plan.floors.length).toBeGreaterThanOrEqual(1);
    expect(plan.facade.features).toContain('Large Glazed Windows');
    expect(plan.budget.total).toBeGreaterThan(0);
    // Dynamic ground coverage calculated from ground floor room areas
    expect(plan.regulatory.groundCoverage).toBe(28.7);
    expect(housePlanZodSchema.safeParse(plan).success).toBe(true);

    vi.doUnmock('@google/genai');
  });

  it('should warn and fall back to deterministic plan when Gemini output fails schema validation', async () => {
    // Return an invalid plan missing required rooms and setbacks
    const invalidGeminiResponse = {
      plot: { width: 30, length: 40, facing: 'East', area: 1200 },
      setbacks: { front: -5, rear: 6.5, left: 3, right: 3 }, // negative setback fails schema
      floors: [],
    };

    vi.doMock('@google/genai', () => {
      return {
        Type: {
          OBJECT: 'OBJECT',
          STRING: 'STRING',
          NUMBER: 'NUMBER',
          INTEGER: 'INTEGER',
          ARRAY: 'ARRAY',
        },
        GoogleGenAI: vi.fn().mockImplementation(() => ({
          models: {
            generateContent: vi.fn().mockResolvedValue({
              text: JSON.stringify(invalidGeminiResponse),
            }),
          },
        })),
      };
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const plan = await generateHousePlan(mockWizardData, 'test-api-key');

    expect(warnSpy).toHaveBeenCalledWith(
      'Gemini plan validation failed:',
      expect.anything()
    );
    expect(plan).toBeDefined();
    expect(plan.floors.length).toBe(2);
    expect(housePlanZodSchema.safeParse(plan).success).toBe(true);

    warnSpy.mockRestore();
    vi.doUnmock('@google/genai');
  });

  it('should fall back to deterministic plan when Gemini API call fails', async () => {
    vi.doMock('@google/genai', () => {
      return {
        Type: {
          OBJECT: 'OBJECT',
          STRING: 'STRING',
          NUMBER: 'NUMBER',
          INTEGER: 'INTEGER',
          ARRAY: 'ARRAY',
        },
        GoogleGenAI: vi.fn().mockImplementation(() => ({
          models: {
            generateContent: vi.fn().mockRejectedValue(new Error('Gemini API quota exceeded')),
          },
        })),
      };
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const plan = await generateHousePlan(mockWizardData, 'invalid-or-failing-key');
    expect(plan.plot.width).toBe(30);
    expect(plan.floors.length).toBe(2);
    expect(housePlanZodSchema.safeParse(plan).success).toBe(true);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();

    vi.doUnmock('@google/genai');
  });
});
