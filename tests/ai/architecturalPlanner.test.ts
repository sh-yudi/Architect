import { describe, it, expect } from 'vitest';
import { generateArchitecturalLayout } from '@/lib/ai/architecturalPlanner';
import { generateHousePlan } from '@/lib/ai/generatePlan';
import { WizardFormData } from '@/types/wizard';

describe('Architectural Planner Engine', () => {
  it('should generate EXACTLY 3 bedrooms and 3 full bathrooms for a G+5 residence', () => {
    const layout = generateArchitecturalLayout({
      plotWidth: 20,
      plotLength: 45,
      buildableWidth: 20,
      buildableLength: 45,
      originX: 0,
      originY: 0,
      floorsCount: 6,
      bedroomsCount: 3,
      bathroomsCount: 3,
      hasPooja: true,
      hasParking: true,
      hasTerrace: true,
      hasBasement: false,
      wishlist: 'G+5 residence with 3 bedrooms and 3 bathrooms',
    });

    expect(layout.floors).toHaveLength(6);

    const allRooms = layout.floors.flatMap((f) => f.rooms);

    // Count bedrooms across all 6 floors
    const bedrooms = allRooms.filter((r) =>
      r.name.toLowerCase().includes('bedroom') && !r.name.toLowerCase().includes('bathroom')
    );
    expect(bedrooms).toHaveLength(3);

    // Verify bedroom placement across vertical hierarchy
    // Level 0 (Ground) = 0 bedrooms
    const gBeds = layout.floors[0].rooms.filter((r) => r.name.toLowerCase().includes('bedroom'));
    expect(gBeds).toHaveLength(0);

    // Level 1 (First) = 0 bedrooms (Formal Living, Dining, Island Kitchen)
    const f1Beds = layout.floors[1].rooms.filter((r) => r.name.toLowerCase().includes('bedroom'));
    expect(f1Beds).toHaveLength(0);

    // Level 2 (Second) = 0 bedrooms (Family Cinema, Study, Gym)
    const f2Beds = layout.floors[2].rooms.filter((r) => r.name.toLowerCase().includes('bedroom'));
    expect(f2Beds).toHaveLength(0);

    // Level 3 (Third) = 1 bedroom (Bedroom 1)
    const f3Beds = layout.floors[3].rooms.filter((r) => r.name.toLowerCase().includes('bedroom'));
    expect(f3Beds).toHaveLength(1);
    expect(f3Beds[0].width).toBeGreaterThanOrEqual(10);

    // Level 4 (Fourth) = 1 bedroom (Bedroom 2)
    const f4Beds = layout.floors[4].rooms.filter((r) => r.name.toLowerCase().includes('bedroom'));
    expect(f4Beds).toHaveLength(1);
    expect(f4Beds[0].width).toBeGreaterThanOrEqual(10);

    // Level 5 (Fifth) = 1 bedroom (Bedroom 3 - Master Penthouse Suite)
    const f5Beds = layout.floors[5].rooms.filter((r) => r.name.toLowerCase().includes('bedroom'));
    expect(f5Beds).toHaveLength(1);
    expect(f5Beds[0].width).toBeGreaterThanOrEqual(10);

    // Verify room dimensions are practical (no 4.5ft habitable rooms)
    const habitableRooms = allRooms.filter((r) =>
      (r.name.toLowerCase().includes('bedroom') || r.name.toLowerCase().includes('living')) &&
      !r.name.toLowerCase().includes('balcony') &&
      !r.name.toLowerCase().includes('porch')
    );
    habitableRooms.forEach((hr) => {
      expect(hr.width).toBeGreaterThanOrEqual(10);
      expect(hr.length).toBeGreaterThanOrEqual(10);
    });

    // Verify engineered structural frame has columns and beams
    expect(layout.structural.columns.length).toBeGreaterThanOrEqual(8);
    expect(layout.structural.beams.length).toBeGreaterThanOrEqual(7);
  });

  it('should generate plan via generateHousePlan respecting 3 bedrooms on G+5', async () => {
    const formData: WizardFormData = {
      plot: {
        width: 20,
        length: 45,
        shape: 'rectangular',
        facing: 'North',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        pincode: '201001',
      },
      requirements: {
        floors: 6,
        bedrooms: 3,
        bathrooms: 3,
        hasLivingRoom: true,
        kitchenType: 'modular',
        parkingSpots: 2,
        hasPoojaRoom: false,
        hasServantQuarter: false,
        hasTerrace: true,
        hasBasement: false,
      },
      preferences: {
        style: 'Modern',
        garden: 'rear',
        balconies: 2,
        windowType: 'standard',
      },
      budget: {
        range: '40-60L',
        qualityTier: 'luxury',
      },
      regulatory: {
        ownerName: 'Test Owner',
        fatherOrSpouseName: 'Test Father',
        khasraNumber: '100',
        khatauniNumber: '20',
        authorityName: 'GDA',
        zone: 'Zone 1',
      },
    };

    const plan = await generateHousePlan(formData);
    expect(plan.floors).toHaveLength(6);

    const allRooms = plan.floors.flatMap((f) => f.rooms);
    const bedrooms = allRooms.filter((r) =>
      r.name.toLowerCase().includes('bedroom') && !r.name.toLowerCase().includes('bathroom')
    );
    expect(bedrooms).toHaveLength(3);
  });
});
