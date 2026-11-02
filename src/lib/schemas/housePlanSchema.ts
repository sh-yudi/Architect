import { z } from 'zod';

export const housePlanZodSchema = z.object({
  customWishlist: z.string().optional().default(''),
  plot: z.object({
    width: z.number().positive(),
    length: z.number().positive(),
    facing: z.enum(['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']),
    area: z.number().positive(),
  }),
  setbacks: z.object({
    front: z.number().nonnegative(),
    rear: z.number().nonnegative(),
    left: z.number().nonnegative(),
    right: z.number().nonnegative(),
  }),
  floors: z.array(
    z.object({
      level: z.number().int(),
      floorName: z.string(),
      rooms: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          x: z.number().nonnegative(),
          y: z.number().nonnegative(),
          width: z.number().positive(),
          length: z.number().positive(),
          doors: z.array(
            z.object({
              id: z.string(),
              wall: z.enum(['top', 'bottom', 'left', 'right']),
              offset: z.number().nonnegative(),
              width: z.number().positive(),
            })
          ).default([]),
          windows: z.array(
            z.object({
              id: z.string(),
              wall: z.enum(['top', 'bottom', 'left', 'right']),
              offset: z.number().nonnegative(),
              width: z.number().positive(),
            })
          ).default([]),
        })
      ),
    })
  ).min(1),
  structural: z.object({
    columns: z.array(
      z.object({
        id: z.string(),
        x: z.number(),
        y: z.number(),
        sizeInches: z.tuple([z.number(), z.number()]),
      })
    ),
    beams: z.array(
      z.object({
        id: z.string(),
        startColumnId: z.string(),
        endColumnId: z.string(),
      })
    ),
    footingType: z.string(),
    slabType: z.string(),
  }),
  electrical: z.object({
    pointsByRoom: z.array(
      z.object({
        roomId: z.string(),
        lightPoints: z.number().nonnegative(),
        fanPoints: z.number().nonnegative(),
        powerSockets: z.number().nonnegative(),
      })
    ),
  }),
  plumbing: z.object({
    inletPoints: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        type: z.string(),
      })
    ),
    outletPoints: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        type: z.string(),
      })
    ),
  }),
  budget: z.object({
    currency: z.literal('INR'),
    total: z.number().positive(),
    lineItems: z.array(
      z.object({
        category: z.enum(['civil', 'finishing', 'services', 'regulatory']),
        name: z.string(),
        amount: z.number().positive(),
      })
    ),
  }),
  facade: z.object({
    style: z.string(),
    features: z.array(z.string()),
    exteriorMaterial: z.string(),
  }),
  regulatory: z.object({
    far: z.number().positive(),
    groundCoverage: z.number().positive(),
    builtUpArea: z.number().positive(),
    violations: z.array(z.string()),
  }),
});

export const wizardFormSchema = z.object({
  customWishlist: z.string().optional().default(''),
  plot: z.object({
    width: z.number().positive(),
    length: z.number().positive(),
    shape: z.enum(['rectangular', 'l-shaped', 'irregular']),
    facing: z.enum(['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
  requirements: z.object({
    floors: z.number().int().positive(),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().int().nonnegative(),
    hasLivingRoom: z.boolean(),
    kitchenType: z.enum(['open', 'closed', 'modular']),
    parkingSpots: z.number().int().nonnegative(),
    hasPoojaRoom: z.boolean(),
    hasServantQuarter: z.boolean(),
    hasTerrace: z.boolean(),
    hasBasement: z.boolean(),
  }),
  preferences: z.object({
    style: z.enum(['Modern', 'Traditional', 'Contemporary', 'Colonial', 'Farmhouse']),
    garden: z.enum(['none', 'front', 'rear', 'both']),
    balconies: z.number().int().nonnegative(),
    windowType: z.enum(['standard', 'large', 'floor-to-ceiling']),
  }),
  budget: z.object({
    range: z.enum(['15-25L', '25-40L', '40-60L', '60-100L', '100L+']),
    qualityTier: z.enum(['economy', 'standard', 'premium', 'luxury']),
  }),
  regulatory: z.object({
    ownerName: z.string(),
    fatherOrSpouseName: z.string(),
    khasraNumber: z.string(),
    khatauniNumber: z.string(),
    authorityName: z.string(),
    zone: z.string(),
  }),
});

export type HousePlanSchemaType = z.infer<typeof housePlanZodSchema>;
export type WizardFormSchemaType = z.infer<typeof wizardFormSchema>;
