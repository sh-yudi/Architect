import { describe, it, expect } from 'vitest';
import { getManualG5Plan } from '@/lib/ai/manualG5Plan';
import { housePlanZodSchema } from '@/lib/schemas/housePlanSchema';

describe('Manual G+5 Architectural Plan Verification', () => {
  const plan = getManualG5Plan();

  it('should strictly validate against housePlanZodSchema with zero schema violations', () => {
    const result = housePlanZodSchema.safeParse(plan);
    if (!result.success) {
      console.error(result.error.flatten());
    }
    expect(result.success).toBe(true);
  });

  it('should have exactly 6 levels (Level 0 through 5 for G+5)', () => {
    expect(plan.floors.length).toBe(6);
    expect(plan.floors.map((f) => f.level)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('Ground Floor (Level 0): must have 6x20 rear garden, stilt parking for 2-3 SUVs, and driver washroom', () => {
    const gFloor = plan.floors.find((f) => f.level === 0)!;
    expect(gFloor).toBeDefined();

    const garden = gFloor.rooms.find((r) => r.name.toLowerCase().includes('garden'))!;
    expect(garden).toBeDefined();
    expect(garden.width).toBe(20);
    expect(garden.length).toBe(6);
    expect(garden.y).toBe(39); // At the back of the 45-foot plot

    const parking = gFloor.rooms.find((r) => r.name.toLowerCase().includes('parking'))!;
    expect(parking).toBeDefined();
    expect(parking.width).toBeGreaterThanOrEqual(12);
    expect(parking.length).toBeGreaterThanOrEqual(25);

    const washroom = gFloor.rooms.find((r) => r.name.toLowerCase().includes('washroom'))!;
    expect(washroom).toBeDefined();
    expect(washroom.width).toBeGreaterThanOrEqual(5);
    expect(washroom.length).toBeGreaterThanOrEqual(5);
  });

  it('1st & 2nd Floors: must each have 4 separate rooms with attached bathrooms, horizontal stair lobby, and private balconies', () => {
    for (const lvl of [1, 2]) {
      const floor = plan.floors.find((f) => f.level === lvl)!;
      expect(floor).toBeDefined();

      // Check 4 separate rooms
      const bedrooms = floor.rooms.filter(
        (r) => r.id.includes('-room')
      );
      expect(bedrooms.length).toBe(4);

      // Check 4 attached bathrooms
      const bathrooms = floor.rooms.filter((r) => r.id.includes('-bath'));
      expect(bathrooms.length).toBe(4);

      // Check horizontal stairs lobby separating front and back
      const horizontalLobby = floor.rooms.find((r) => r.name.toLowerCase().includes('horizontal'));
      expect(horizontalLobby).toBeDefined();
      expect(horizontalLobby!.y).toBe(14); // Positioned between front (y=0..14) and back (y=23..39)

      // Front rooms (Room 1 & Room 2) must be positioned in front half (y < 14)
      const frontRooms = bedrooms.filter((r) => r.y < 14);
      expect(frontRooms.length).toBe(2);

      // Rear rooms (Room 3 & Room 4) must be positioned in back half (y >= 23)
      const rearRooms = bedrooms.filter((r) => r.y >= 23);
      expect(rearRooms.length).toBe(2);

      // Balconies: Front balconies for front rooms, courtyard balconies for rear rooms
      const balconies = floor.rooms.filter((r) => r.name.toLowerCase().includes('balcony'));
      expect(balconies.length).toBe(4);

      // Rear 6x20 OTS Garden void
      const otsGarden = floor.rooms.find((r) => r.name.toLowerCase().includes('open-to-sky'));
      expect(otsGarden).toBeDefined();
      expect(otsGarden!.width).toBe(20);
      expect(otsGarden!.length).toBe(6);
    }
  });

  it('3rd Floor (Duplex Lower): express lift directly opens, double-height drawing room, kitchen, guest room & bath', () => {
    const f3 = plan.floors.find((f) => f.level === 3)!;
    expect(f3).toBeDefined();

    // Direct express lift lobby
    const liftLobby = f3.rooms.find((r) => r.name.toLowerCase().includes('express lift'));
    expect(liftLobby).toBeDefined();
    expect(liftLobby!.name).toContain('Direct Express Lift Entrance Lobby');

    // Double-height grand formal drawing room
    const drawing = f3.rooms.find((r) => r.id === 'f3-drawing-room')!;
    expect(drawing).toBeDefined();
    expect(drawing.width).toBe(20); // Spans full width for grand volume!
    expect(drawing.name).toContain('Double-Height');

    // Modular kitchen
    const kitchen = f3.rooms.find((r) => r.name.toLowerCase().includes('kitchen'));
    expect(kitchen).toBeDefined();

    // Guest bedroom suite & attached bath
    const guestBed = f3.rooms.find((r) => r.name.toLowerCase().includes('guest bedroom'));
    const guestBath = f3.rooms.find((r) => r.name.toLowerCase().includes('guest bathroom'));
    expect(guestBed).toBeDefined();
    expect(guestBath).toBeDefined();

    // Duplex stair connector
    const duplexStair = f3.rooms.find((r) => r.name.toLowerCase().includes('duplex'));
    expect(duplexStair).toBeDefined();
  });

  it('4th Floor (Duplex Upper): double-height void overlook, mezzanine lounge, and 2 master suites with attached baths & balconies', () => {
    const f4 = plan.floors.find((f) => f.level === 4)!;
    expect(f4).toBeDefined();

    // Double-height void overlook
    const voidOverlook = f4.rooms.find((r) => r.name.toLowerCase().includes('void'));
    expect(voidOverlook).toBeDefined();
    expect(voidOverlook!.width).toBe(20);

    // Mezzanine bridge / lounge
    const mezzanine = f4.rooms.find((r) => r.name.toLowerCase().includes('mezzanine'));
    expect(mezzanine).toBeDefined();

    // 2 Master Suites
    const master1 = f4.rooms.find((r) => r.name.toLowerCase().includes('master suite 1'));
    const master2 = f4.rooms.find((r) => r.name.toLowerCase().includes('master suite 2'));
    expect(master1).toBeDefined();
    expect(master2).toBeDefined();

    // Attached luxury baths for each master suite
    const master1Bath = f4.rooms.find((r) => r.name.toLowerCase().includes('master bath 1'));
    const master2Bath = f4.rooms.find((r) => r.name.toLowerCase().includes('master bath 2'));
    expect(master1Bath).toBeDefined();
    expect(master2Bath).toBeDefined();

    // Private rear balconies overlooking garden courtyard
    const rearBalconies = f4.rooms.filter((r) => r.name.toLowerCase().includes('balcony'));
    expect(rearBalconies.length).toBe(2);
  });

  it('5th Floor (Penthouse): spacious master suite, open sky terrace, covered cocktail bar corner & pergola', () => {
    const f5 = plan.floors.find((f) => f.level === 5)!;
    expect(f5).toBeDefined();

    // Open sky terrace
    const terrace = f5.rooms.find((r) => r.name.toLowerCase().includes('terrace garden'));
    expect(terrace).toBeDefined();
    expect(terrace!.width).toBe(13);

    // Covered cocktail bar
    const bar = f5.rooms.find((r) => r.name.toLowerCase().includes('cocktail bar'));
    expect(bar).toBeDefined();
    expect(bar!.width).toBe(7);

    // Spacious penthouse master suite & luxury spa bath with soaking tub
    const pentSuite = f5.rooms.find((r) => r.name.toLowerCase().includes('penthouse master suite'));
    const spaBath = f5.rooms.find((r) => r.name.toLowerCase().includes('spa bath'));
    expect(pentSuite).toBeDefined();
    expect(spaBath).toBeDefined();

    // Rear 6x20 garden lightwell reaches roof
    const otsGarden = f5.rooms.find((r) => r.name.toLowerCase().includes('garden lightwell'));
    expect(otsGarden).toBeDefined();
    expect(otsGarden!.width).toBe(20);
    expect(otsGarden!.length).toBe(6);
  });

  it('Rear garden has open area till the top: 6x20 OTS area is present across all floors at the back', () => {
    for (const floor of plan.floors) {
      const rearElement = floor.rooms.find(
        (r) =>
          r.y === 39 &&
          r.width === 20 &&
          r.length === 6 &&
          (r.name.toLowerCase().includes('garden') || r.name.toLowerCase().includes('open'))
      );
      expect(rearElement).toBeDefined();
    }
  });
});
