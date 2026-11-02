import { describe, it, expect } from 'vitest';
import { housePlanZodSchema, wizardFormSchema } from '@/lib/schemas/housePlanSchema';
import type { HousePlan } from '@/types/plan';
import type { WizardFormData } from '@/types/wizard';

describe('HousePlan Zod Schema', () => {
  const validPlan: HousePlan = {
    plot: { width: 30, length: 40, facing: 'East', area: 1200 },
    setbacks: { front: 10, rear: 5, left: 3, right: 3 },
    floors: [
      {
        level: 0,
        floorName: 'Ground Floor',
        rooms: [
          { id: 'r1', name: 'Living Hall', x: 0, y: 0, width: 14, length: 16, doors: [], windows: [] },
          { id: 'r2', name: 'Kitchen', x: 14, y: 0, width: 10, length: 10, doors: [], windows: [] }
        ]
      }
    ],
    structural: {
      columns: [{ id: 'c1', x: 0, y: 0, sizeInches: [9, 12] }],
      beams: [{ id: 'b1', startColumnId: 'c1', endColumnId: 'c2' }],
      footingType: 'isolated',
      slabType: 'RCC flat slab'
    },
    electrical: {
      pointsByRoom: [{ roomId: 'r1', lightPoints: 3, fanPoints: 2, powerSockets: 4 }]
    },
    plumbing: {
      inletPoints: [{ x: 14, y: 0, type: 'kitchen_sink' }],
      outletPoints: [{ x: 14, y: 10, type: 'drainage' }]
    },
    budget: {
      currency: 'INR',
      total: 2850000,
      lineItems: [
        { category: 'civil', name: 'Structure & Masonry', amount: 1600000 },
        { category: 'finishing', name: 'Flooring & Paint', amount: 750000 },
        { category: 'services', name: 'Plumbing & Electrical', amount: 500000 }
      ]
    },
    facade: {
      style: 'Modern',
      features: ['Wide picture windows', 'Textured exterior paneling', 'Flat parapet roof'],
      exteriorMaterial: 'Sand-faced plaster with weather-shield coat'
    },
    regulatory: {
      far: 1.8,
      groundCoverage: 55.4,
      builtUpArea: 1950,
      violations: []
    }
  };

  it('should validate a valid complete house plan JSON', () => {
    const parsed = housePlanZodSchema.safeParse(validPlan);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const plan: HousePlan = parsed.data;
      expect(plan.plot.facing).toBe('East');
    }
  });

  it('should reject invalid house plan with missing mandatory fields', () => {
    const invalidPlan = {
      plot: { width: 30 }, // missing length, area, facing
    };
    const parsed = housePlanZodSchema.safeParse(invalidPlan);
    expect(parsed.success).toBe(false);
  });

  it('should reject non-positive dimensions', () => {
    const invalidPlot = {
      ...validPlan,
      plot: { ...validPlan.plot, width: -10 }
    };
    const parsed = housePlanZodSchema.safeParse(invalidPlot);
    expect(parsed.success).toBe(false);
  });

  it('should default doors and windows to empty arrays if omitted', () => {
    const planWithoutDoorsWindows = {
      ...validPlan,
      floors: [
        {
          level: 0,
          floorName: 'Ground Floor',
          rooms: [
            { id: 'r1', name: 'Living Hall', x: 0, y: 0, width: 14, length: 16 }
          ]
        }
      ]
    };
    const parsed = housePlanZodSchema.safeParse(planWithoutDoorsWindows);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.floors[0].rooms[0].doors).toEqual([]);
      expect(parsed.data.floors[0].rooms[0].windows).toEqual([]);
    }
  });

  it('should reject plans with empty floors array', () => {
    const emptyFloorsPlan = {
      ...validPlan,
      floors: []
    };
    const parsed = housePlanZodSchema.safeParse(emptyFloorsPlan);
    expect(parsed.success).toBe(false);
  });
});

describe('WizardForm Zod Schema', () => {
  const validFormData: WizardFormData = {
    plot: {
      width: 30,
      length: 40,
      shape: 'rectangular',
      facing: 'East',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201001'
    },
    requirements: {
      floors: 2,
      bedrooms: 3,
      bathrooms: 2,
      hasLivingRoom: true,
      kitchenType: 'modular',
      parkingSpots: 1,
      hasPoojaRoom: true,
      hasServantQuarter: false,
      hasTerrace: true,
      hasBasement: false
    },
    preferences: {
      style: 'Modern',
      garden: 'front',
      balconies: 2,
      windowType: 'large'
    },
    budget: {
      range: '25-40L',
      qualityTier: 'standard'
    },
    regulatory: {
      ownerName: 'Rajesh Sharma',
      fatherOrSpouseName: 'Late K. C. Sharma',
      khasraNumber: '142/2',
      khatauniNumber: '00341',
      authorityName: 'Ghaziabad Development Authority',
      zone: 'Zone 4'
    }
  };

  it('should validate valid wizard form data', () => {
    const parsed = wizardFormSchema.safeParse(validFormData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const data: WizardFormData = parsed.data;
      expect(data.plot.city).toBe('Ghaziabad');
    }
  });

  it('should reject invalid wizard form data with missing required fields', () => {
    const invalidFormData = {
      plot: { width: 30 }
    };
    const parsed = wizardFormSchema.safeParse(invalidFormData);
    expect(parsed.success).toBe(false);
  });
});
