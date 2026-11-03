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

  it('should generate dynamic multi-floor architectural plans for 4+ floors with basement and custom wishlist', async () => {
    const multiFloorData: WizardFormData = {
      ...mockWizardData,
      customWishlist: 'Rooftop infinity terrace with double height formal drawing room and basement gym',
      requirements: {
        ...mockWizardData.requirements,
        floors: 4,
        bedrooms: 6,
        bathrooms: 6,
        hasBasement: true,
      },
    };

    // Verify prompt builder injects custom wishlist and floor requests
    const rules = getRegulatoryRules('GDA');
    const prompt = buildHousePlanPrompt(multiFloorData, rules);
    expect(prompt).toContain("CLIENT'S DETAILED VISION & CUSTOM HOUSE REQUIREMENTS");
    expect(prompt).toContain('Rooftop infinity terrace');
    expect(prompt).toContain('Number of floors: 4 floors');

    // Generate deterministic plan with 4 floors + basement
    const plan = await generateHousePlan(multiFloorData, undefined);
    // 4 floors + 1 basement = 5 floors total
    expect(plan.floors.length).toBe(5);
    expect(plan.floors[0].floorName).toBe('Basement Floor Plan');
    expect(plan.floors[1].floorName).toBe('Ground Floor Plan');
    expect(plan.floors[2].floorName).toBe('First Floor Plan');
    expect(plan.floors[3].floorName).toBe('Second Floor Plan');
    expect(plan.floors[4].floorName).toBe('Top Floor (Level 3)');
    expect(plan.customWishlist).toBe('Rooftop infinity terrace with double height formal drawing room and basement gym');

    // Verify all rooms have doors, windows, and valid coordinates
    for (const floor of plan.floors) {
      expect(floor.rooms.length).toBeGreaterThanOrEqual(1);
      for (const room of floor.rooms) {
        expect(room.width).toBeGreaterThan(0);
        expect(room.length).toBeGreaterThan(0);
        expect(room.doors).toBeDefined();
        expect(room.windows).toBeDefined();
      }
    }

    const validation = housePlanZodSchema.safeParse(plan);
    expect(validation.success).toBe(true);
  });

  it('should accurately parse and generate a G+5 building tailored to custom floor-by-floor prompt', async () => {
    const userPrompt =
      'I want to create a G+5 in which g floor consust of one garden on back side of 6*20 size and whole rest part will be parking with one good size washroom 1st n 2nd floor will consist of 4 rooms with attached bathroom And after that 3rd n 4th floor will be duplex type which have a double heighted drawing room one kitchen one guest room and 2 master suits 5th floor consist one spacious master suite with open terrace with one bar corner';

    const g5FormData: WizardFormData = {
      ...mockWizardData,
      customWishlist: userPrompt,
      requirements: {
        ...mockWizardData.requirements,
        floors: 6, // G+5 = 6 levels
      },
    };

    const plan = await generateHousePlan(g5FormData, undefined);

    // Expect 6 floors (Level 0 through 5)
    expect(plan.floors.length).toBe(6);

    // Ground Floor: Must contain parking, rear garden (6x20), and washroom/powder toilet
    const gFloor = plan.floors.find((f) => f.level === 0)!;
    expect(gFloor).toBeDefined();
    const gNames = gFloor.rooms.map((r) => r.name.toLowerCase());
    expect(gNames.some((n) => n.includes('parking') || n.includes('stilt'))).toBe(true);
    expect(gNames.some((n) => n.includes('garden') || n.includes('lawn'))).toBe(true);
    expect(gNames.some((n) => n.includes('washroom') || n.includes('toilet') || n.includes('bath'))).toBe(true);

    // 1st & 2nd Floors: In practical Indian architecture on 20-30' plots, the client's request
    // of "1st n 2nd floor will consist of 4 rooms with attached bathroom" translates to
    // 2 Grand Master Suites per floor (Suites 1 & 2 on Fl 1, Suites 3 & 4 on Fl 2) = 4 luxury suites total!
    // Every bedroom must be practical (width >= 12'-0", never 4.5' corridors!)
    const f1 = plan.floors.find((f) => f.level === 1)!;
    const f1Suites = f1.rooms.filter((r) => r.name.toLowerCase().includes('suite') || r.name.toLowerCase().includes('bed'));
    const f1Baths = f1.rooms.filter((r) => r.name.toLowerCase().includes('bath'));
    expect(f1Suites.length).toBeGreaterThanOrEqual(2);
    expect(f1Baths.length).toBeGreaterThanOrEqual(2);
    for (const suite of f1Suites) {
      expect(suite.width).toBeGreaterThanOrEqual(12.0); // Practical bedroom width
      expect(suite.length).toBeGreaterThanOrEqual(8.0);
    }
    for (const bath of f1Baths) {
      expect(bath.width).toBeGreaterThanOrEqual(6.0); // Practical luxury bathroom width
    }

    const f2 = plan.floors.find((f) => f.level === 2)!;
    const f2Suites = f2.rooms.filter((r) => r.name.toLowerCase().includes('suite') || r.name.toLowerCase().includes('bed'));
    const f2Baths = f2.rooms.filter((r) => r.name.toLowerCase().includes('bath'));
    expect(f2Suites.length).toBeGreaterThanOrEqual(2);
    expect(f2Baths.length).toBeGreaterThanOrEqual(2);
    for (const suite of f2Suites) {
      expect(suite.width).toBeGreaterThanOrEqual(12.0);
      expect(suite.length).toBeGreaterThanOrEqual(8.0);
    }
    for (const bath of f2Baths) {
      expect(bath.width).toBeGreaterThanOrEqual(6.0);
    }
    // Total master suites across 1st & 2nd floors equals 4 suites with attached baths
    expect(f1Suites.length + f2Suites.length).toBeGreaterThanOrEqual(4);
    expect(f1Baths.length + f2Baths.length).toBeGreaterThanOrEqual(4);

    // 3rd Floor (Lower Duplex): Double-height drawing room, kitchen, guest room, guest bath
    const f3 = plan.floors.find((f) => f.level === 3)!;
    const f3Names = f3.rooms.map((r) => r.name.toLowerCase());
    expect(f3Names.some((n) => n.includes('drawing') || n.includes('living'))).toBe(true);
    expect(f3Names.some((n) => n.includes('kitchen'))).toBe(true);
    expect(f3Names.some((n) => n.includes('guest'))).toBe(true);

    // 4th Floor (Upper Duplex): Double-height void/overlook, 2 master suites with attached baths
    const f4 = plan.floors.find((f) => f.level === 4)!;
    const f4Names = f4.rooms.map((r) => r.name.toLowerCase());
    expect(f4Names.some((n) => n.includes('void') || n.includes('overlook') || n.includes('mezzanine') || n.includes('lounge'))).toBe(true);
    const f4MasterSuites = f4.rooms.filter((r) => r.name.toLowerCase().includes('master'));
    expect(f4MasterSuites.length).toBeGreaterThanOrEqual(2);

    // 5th Floor: Spacious master suite, open terrace, bar corner
    const f5 = plan.floors.find((f) => f.level === 5)!;
    const f5Names = f5.rooms.map((r) => r.name.toLowerCase());
    expect(f5Names.some((n) => n.includes('master'))).toBe(true);
    expect(f5Names.some((n) => n.includes('terrace'))).toBe(true);
    expect(f5Names.some((n) => n.includes('bar'))).toBe(true);

    const validation = housePlanZodSchema.safeParse(plan);
    expect(validation.success).toBe(true);
  });

  it('should generate verified manual G+5 plan with horizontal stair lobby, 4 rooms with attached baths, express lift, and open garden till the top', async () => {
    const fullUserPrompt =
      'I want to create a G+5 in which g floor consist of one garden on back side of 6*20 size and whole rest part will be parking with one good size washroom 1st n 2nd floor will consist of 4 separate rooms with attached bathroom in each room And after that 3rd n 4th floor will be duplex type which have a double heighted drawing room one kitchen one guest room and 2 master suits 5th floor consist one spacious master suite with open terrace with one bar corner there should be a lift that will directly open to the 3rd floor not on 1&2 floor also, the stairs lobby should be horizontally that will diffenectiat the front part and back part of the plot in half and use your brain to develop the balconies also the garden on the ground floor will have the open area till the last';

    const promptData: WizardFormData = {
      ...mockWizardData,
      customWishlist: fullUserPrompt,
      requirements: {
        ...mockWizardData.requirements,
        floors: 6,
      },
    };

    const plan = await generateHousePlan(promptData, undefined);
    expect(plan.floors.length).toBe(6);

    // Floor 1 & 2 must have 4 rooms each with attached baths & horizontal stair lobby
    for (const lvl of [1, 2]) {
      const fl = plan.floors.find((f) => f.level === lvl)!;
      const rooms = fl.rooms.filter((r) => r.id.includes('-room'));
      const baths = fl.rooms.filter((r) => r.id.includes('-bath'));
      expect(rooms.length).toBe(4);
      expect(baths.length).toBe(4);
      expect(fl.rooms.some((r) => r.name.toLowerCase().includes('horizontal'))).toBe(true);
    }

    // Floor 3 must have direct express lift and double-height drawing room
    const f3 = plan.floors.find((f) => f.level === 3)!;
    expect(f3.rooms.some((r) => r.name.toLowerCase().includes('express lift'))).toBe(true);
    expect(f3.rooms.some((r) => r.name.toLowerCase().includes('double-height'))).toBe(true);

    // Floor 5 must have open terrace and cocktail bar
    const f5 = plan.floors.find((f) => f.level === 5)!;
    expect(f5.rooms.some((r) => r.name.toLowerCase().includes('terrace'))).toBe(true);
    expect(f5.rooms.some((r) => r.name.toLowerCase().includes('bar'))).toBe(true);

    // Open garden till the top
    for (const fl of plan.floors) {
      expect(fl.rooms.some((r) => r.name.toLowerCase().includes('garden') || r.name.toLowerCase().includes('open'))).toBe(true);
    }
  });
});
