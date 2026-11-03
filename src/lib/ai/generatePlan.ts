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

export function extractRequirementsFromPrompt(
  prompt: string,
  current: WizardFormData['requirements']
): WizardFormData['requirements'] {
  const lower = prompt.toLowerCase();
  let floors = current.floors;

  // Extract G+N (e.g. G+5 => 6 floors)
  const gpMatch = lower.match(/g\s*\+\s*(\d+)/);
  if (gpMatch) {
    floors = parseInt(gpMatch[1], 10) + 1;
  } else {
    const floorMatch = lower.match(/(\d+)\s*(?:floors?|storeys?|stories?|levels?)/);
    if (floorMatch) {
      floors = parseInt(floorMatch[1], 10);
    }
  }

  const hasBasement = current.hasBasement || lower.includes('basement');
  const hasTerrace = current.hasTerrace || lower.includes('terrace');
  const hasParking = current.parkingSpots > 0 || lower.includes('parking') || lower.includes('stilt');
  const hasPoojaRoom = current.hasPoojaRoom || lower.includes('pooja') || lower.includes('mandir');

  return {
    ...current,
    floors: Math.max(floors, 1),
    hasBasement,
    hasTerrace,
    hasPoojaRoom,
    parkingSpots: hasParking ? Math.max(current.parkingSpots, 1) : 0,
  };
}

function generateDynamicArchitecturalFloors(config: LayoutConfig): FloorPlan[] {
  const {
    buildableWidth,
    buildableLength,
    originX,
    originY,
    floorsCount,
    bedroomsCount,
    bathroomsCount,
    hasPooja,
    hasParking,
    wishlist,
  } = config;

  const floors: FloorPlan[] = [];
  const lowerWish = wishlist.toLowerCase();

  // Keyword extraction from user wishlist
  const wantsGym = lowerWish.includes('gym') || lowerWish.includes('fitness') || lowerWish.includes('workout');
  const wantsTheatre = lowerWish.includes('theatre') || lowerWish.includes('theater') || lowerWish.includes('cinema') || lowerWish.includes('media');
  const wantsStudy = lowerWish.includes('study') || lowerWish.includes('office') || lowerWish.includes('library') || lowerWish.includes('work');
  const wantsOpenKitchen = lowerWish.includes('open') || lowerWish.includes('island');

  const isStiltParkingGround =
    lowerWish.includes('parking') &&
    (lowerWish.includes('g floor') ||
      lowerWish.includes('ground floor') ||
      lowerWish.includes('rest part will be parking') ||
      lowerWish.includes('stilt') ||
      lowerWish.includes('whole rest'));

  const isFourRoomFloor =
    lowerWish.includes('4 room') ||
    lowerWish.includes('4 rooms') ||
    lowerWish.includes('4 bed') ||
    lowerWish.includes('4 beds') ||
    (lowerWish.includes('1st') && lowerWish.includes('4'));

  const isDuplexBuilding =
    lowerWish.includes('duplex') ||
    lowerWish.includes('double height') ||
    lowerWish.includes('double heighted');

  const hasPenthouseTop =
    lowerWish.includes('5th') ||
    lowerWish.includes('penthouse') ||
    lowerWish.includes('bar') ||
    (lowerWish.includes('master') && lowerWish.includes('terrace'));

  // Exact zone calculation ensuring sum(lengths) === buildableLength with ZERO overflow or overhang
  let frontZoneLength = Math.max(Math.floor(buildableLength * 0.36), 8);
  let midZoneLength = Math.max(Math.floor(buildableLength * 0.32), 8);
  let rearZoneLength = buildableLength - frontZoneLength - midZoneLength;

  if (rearZoneLength < 8) {
    frontZoneLength = Math.floor(buildableLength * 0.36);
    midZoneLength = Math.floor(buildableLength * 0.32);
    rearZoneLength = buildableLength - frontZoneLength - midZoneLength;
  }

  // Exact column width calculation ensuring sum(widths) === buildableWidth with ZERO overflow
  const isNarrowPlot = buildableWidth < 24;
  const leftColWidth = isNarrowPlot ? Math.min(Math.max(Math.floor(buildableWidth * 0.65), 12), buildableWidth - 6.5) : Math.floor(buildableWidth * 0.55);
  const rightColWidth = buildableWidth - leftColWidth;

  // 1. BASEMENT (If requested or mentioned in wishlist)
  if (config.hasBasement || lowerWish.includes('basement')) {
    const basementRearW1 = Math.floor(buildableWidth * 0.5);
    const basementRearW2 = buildableWidth - basementRearW1;

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
        width: basementRearW1,
        length: rearZoneLength,
        doors: [{ id: 'bd-3', wall: 'top', offset: 2, width: 2.5 }],
        windows: [],
      },
      {
        id: 'b-4',
        name: 'Basement Powder Toilet',
        x: originX + basementRearW1,
        y: originY + frontZoneLength + midZoneLength,
        width: basementRearW2,
        length: rearZoneLength,
        doors: [{ id: 'bd-4', wall: 'top', offset: 2, width: 2.5 }],
        windows: [],
      },
    ];
    floors.push({ level: -1, floorName: 'Basement Floor Plan', rooms: basementRooms });
  }

  // 2. Helper floor generators for prompt-specialized architectures
  const generateMasterSuitesFloor = (
    lvl: number,
    floorName: string,
    suiteStartNum: number
  ): FloorPlan => {
    const fRooms: Room[] = [];
    const prefix = `f${lvl}`;

    // Layout configuration:
    // Left Column (leftColWidth >= 12'-0" to 14'-0") - Front Balcony, Front Master Suite, Rear Master Suite, Rear Balcony
    // Right Column (rightColWidth >= 6'-6" to 8'-0") - Attached Bath 1, Central Core, Walk-in Dresser, Attached Bath 2
    const balcLen = Math.min(Math.max(Math.floor(buildableLength * 0.1), 3.0), 4.5);
    const usableDepth = buildableLength - 2 * balcLen;
    const frontBedLen = Math.floor(usableDepth * 0.48);
    const rearBedLen = usableDepth - frontBedLen;

    const bathLen = Math.max(Math.floor(buildableLength * 0.22), 5);
    const stairLen = Math.max(Math.floor(buildableLength * 0.28), 6);
    const dressLen = Math.max(Math.floor(buildableLength * 0.22), 4);
    const bath2Len = buildableLength - bathLen - stairLen - dressLen;

    // Left Column (Main Living & Bed Suites - Width >= 12'-0" to 14'-0"):
    // 1. Front Sit-out Balcony
    fRooms.push({
      id: `${prefix}-balc-front`,
      name: 'Front Sit-out Balcony',
      x: originX,
      y: originY,
      width: leftColWidth,
      length: balcLen,
      doors: [{ id: `${prefix}-bfd`, wall: 'bottom', offset: Math.floor(leftColWidth / 2), width: 3.5 }],
      windows: [],
    });

    // 2. Front Grand Master Suite (Suite 1 on Fl 1 / Suite 3 on Fl 2)
    fRooms.push({
      id: `${prefix}-suite-front`,
      name: `Grand Master Suite ${suiteStartNum} (Front Balcony)`,
      x: originX,
      y: originY + balcLen,
      width: leftColWidth,
      length: frontBedLen,
      doors: [
        { id: `${prefix}-sfd-core`, wall: 'right', offset: Math.max(frontBedLen - 3, 2), width: 3.0 },
        { id: `${prefix}-sfd-bath`, wall: 'right', offset: 2.0, width: 2.5 },
      ],
      windows: [
        { id: `${prefix}-sfw-front`, wall: 'top', offset: 2.5, width: Math.min(leftColWidth - 2, 5.0) },
        { id: `${prefix}-sfw-side`, wall: 'left', offset: 3, width: 4.0 },
      ],
    });

    // 3. Rear Grand Master Suite (Suite 2 on Fl 1 / Suite 4 on Fl 2)
    fRooms.push({
      id: `${prefix}-suite-rear`,
      name: `Grand Master Suite ${suiteStartNum + 1} (Garden View)`,
      x: originX,
      y: originY + balcLen + frontBedLen,
      width: leftColWidth,
      length: rearBedLen,
      doors: [
        { id: `${prefix}-srd-core`, wall: 'right', offset: 1.5, width: 3.0 },
        { id: `${prefix}-srd-bath`, wall: 'right', offset: Math.max(rearBedLen - 3, 2), width: 2.5 },
        { id: `${prefix}-srd-balc`, wall: 'bottom', offset: Math.floor(leftColWidth / 2), width: 3.5 },
      ],
      windows: [
        { id: `${prefix}-srw-rear`, wall: 'bottom', offset: 2, width: Math.min(leftColWidth - 2, 4.5) },
        { id: `${prefix}-srw-side`, wall: 'left', offset: 3, width: 4.0 },
      ],
    });

    // 4. Rear Garden View Balcony
    fRooms.push({
      id: `${prefix}-balc-rear`,
      name: 'Rear Garden View Balcony',
      x: originX,
      y: originY + buildableLength - balcLen,
      width: leftColWidth,
      length: balcLen,
      doors: [{ id: `${prefix}-brd`, wall: 'top', offset: Math.floor(leftColWidth / 2), width: 3.5 }],
      windows: [],
    });

    // Right Column (Sequentially arranged along full depth - each gets full rightColWidth >= 6.5' to 8.0'):
    // 5. Attached Luxury Master Bath 1 (for Front Suite)
    fRooms.push({
      id: `${prefix}-bath1`,
      name: `Attached Luxury Bath ${suiteStartNum}`,
      x: originX + leftColWidth,
      y: originY,
      width: rightColWidth,
      length: bathLen,
      doors: [{ id: `${prefix}-b1d`, wall: 'left', offset: 2.0, width: 2.5 }],
      windows: [{ id: `${prefix}-b1w`, wall: 'right', offset: 1.5, width: 2.5 }],
    });

    // 6. Central Staircase & Lift Core Lobby
    fRooms.push({
      id: `${prefix}-core`,
      name: 'Staircase & High-Speed Lift Lobby',
      x: originX + leftColWidth,
      y: originY + bathLen,
      width: rightColWidth,
      length: stairLen,
      doors: [{ id: `${prefix}-cd`, wall: 'left', offset: 2.0, width: 3.0 }],
      windows: [{ id: `${prefix}-cw`, wall: 'right', offset: 2.0, width: 3.0 }],
    });

    // 7. Walk-in Wardrobe / Dressing Lounge for Rear Suite
    fRooms.push({
      id: `${prefix}-dress`,
      name: `Walk-in Wardrobe & Dressing Room`,
      x: originX + leftColWidth,
      y: originY + bathLen + stairLen,
      width: rightColWidth,
      length: dressLen,
      doors: [{ id: `${prefix}-drd`, wall: 'left', offset: 1.5, width: 2.5 }],
      windows: [{ id: `${prefix}-drw`, wall: 'right', offset: 1.5, width: 2.0 }],
    });

    // 8. Attached Luxury Master Bath 2 (for Rear Suite)
    fRooms.push({
      id: `${prefix}-bath2`,
      name: `Attached Luxury Bath ${suiteStartNum + 1}`,
      x: originX + leftColWidth,
      y: originY + bathLen + stairLen + dressLen,
      width: rightColWidth,
      length: buildableLength - (bathLen + stairLen + dressLen),
      doors: [{ id: `${prefix}-b2d`, wall: 'left', offset: 2.0, width: 2.5 }],
      windows: [{ id: `${prefix}-b2w`, wall: 'right', offset: 1.5, width: 2.5 }],
    });

    return { level: lvl, floorName, rooms: fRooms };
  };

  const generateFourRoomFloor = (lvl: number, floorName: string): FloorPlan => {
    // In professional Indian architecture, the client's brief for 4 rooms across 1st & 2nd floor is distributed
    // as 2 Grand Master Suites per floor (Suites 1 & 2 on Floor 1, Suites 3 & 4 on Floor 2).
    const suiteStart = lvl === 1 ? 1 : 3;
    return generateMasterSuitesFloor(lvl, floorName, suiteStart);
  };

  const generateDuplexLowerFloor = (lvl: number): FloorPlan => {
    const fRooms: Room[] = [];
    const prefix = `f${lvl}`;

    const frontLen = Math.floor(buildableLength * 0.52);
    const rearLen = buildableLength - frontLen;

    const kitchenLen = Math.floor(frontLen * 0.52);
    const diningLen = frontLen - kitchenLen;

    const stairLen = Math.min(Math.max(Math.floor(rearLen * 0.55), 8.5), 10.5);
    const bathLen = rearLen - stairLen;

    // Left Column (Width >= 12'-0" to 14'-0"):
    // 1. Double-Height Formal Drawing & Living Room
    fRooms.push({
      id: `${prefix}-drawing`,
      name: 'Double-Height Formal Drawing & Living Room',
      x: originX,
      y: originY,
      width: leftColWidth,
      length: frontLen,
      doors: [{ id: `${prefix}-d-main`, wall: 'right', offset: Math.max(frontLen - 3, 2), width: 3.5 }],
      windows: [
        { id: `${prefix}-w-front`, wall: 'top', offset: 3, width: Math.min(leftColWidth - 2, 6.0) },
        { id: `${prefix}-w-side`, wall: 'left', offset: 4, width: 4.5 },
      ],
    });

    // 2. Executive Guest Bedroom Suite
    fRooms.push({
      id: `${prefix}-guestbed`,
      name: 'Executive Guest Bedroom Suite',
      x: originX,
      y: originY + frontLen,
      width: leftColWidth,
      length: rearLen,
      doors: [
        { id: `${prefix}-gd-core`, wall: 'right', offset: 2, width: 3.0 },
        { id: `${prefix}-gd-bath`, wall: 'right', offset: Math.max(rearLen - 3, 2), width: 2.5 },
      ],
      windows: [
        { id: `${prefix}-gw-rear`, wall: 'bottom', offset: 2.5, width: Math.min(leftColWidth - 2, 4.5) },
        { id: `${prefix}-gw-side`, wall: 'left', offset: 3, width: 4.0 },
      ],
    });

    // Right Column (Width >= 6.5' to 8.0' - full column width for each zone sequentially!):
    // 3. Modular Kitchen & Breakfast Island
    fRooms.push({
      id: `${prefix}-kitchen`,
      name: 'Modular Kitchen & Breakfast Island',
      x: originX + leftColWidth,
      y: originY,
      width: rightColWidth,
      length: kitchenLen,
      doors: [{ id: `${prefix}-kd`, wall: 'left', offset: 2, width: 3.0 }],
      windows: [{ id: `${prefix}-kw`, wall: 'right', offset: 2, width: 3.0 }],
    });

    // 4. Central Dining Hall & Internal Duplex Stair
    fRooms.push({
      id: `${prefix}-dining`,
      name: 'Central Dining Hall & Internal Duplex Stair',
      x: originX + leftColWidth,
      y: originY + kitchenLen,
      width: rightColWidth,
      length: diningLen,
      doors: [{ id: `${prefix}-dd`, wall: 'left', offset: 2, width: 3.0 }],
      windows: [{ id: `${prefix}-dw`, wall: 'right', offset: 2, width: 3.0 }],
    });

    // 5. Main Staircase & Lift Core Lobby
    fRooms.push({
      id: `${prefix}-staircore`,
      name: 'Main Staircase & Lift Core Lobby',
      x: originX + leftColWidth,
      y: originY + frontLen,
      width: rightColWidth,
      length: stairLen,
      doors: [{ id: `${prefix}-sd`, wall: 'left', offset: 2.0, width: 3.0 }],
      windows: [{ id: `${prefix}-sw`, wall: 'right', offset: 2.0, width: 2.5 }],
    });

    // 6. Attached Guest Bathroom & Powder
    fRooms.push({
      id: `${prefix}-guestbath`,
      name: 'Attached Guest Bathroom & Powder',
      x: originX + leftColWidth,
      y: originY + frontLen + stairLen,
      width: rightColWidth,
      length: bathLen,
      doors: [{ id: `${prefix}-gbd`, wall: 'left', offset: 1.5, width: 2.5 }],
      windows: [{ id: `${prefix}-gbw`, wall: 'right', offset: 1.5, width: 2.0 }],
    });

    return { level: lvl, floorName: 'Third Floor (Duplex Lower Level)', rooms: fRooms };
  };

  const generateDuplexUpperFloor = (lvl: number): FloorPlan => {
    const fRooms: Room[] = [];
    const prefix = `f${lvl}`;

    const voidLen = Math.max(Math.floor(buildableLength * 0.25), 4);
    const remainLen = buildableLength - voidLen;
    const suite1Len = Math.floor(remainLen * 0.5);
    const suite2Len = remainLen - suite1Len;

    let bath1Len = Math.max(Math.floor(remainLen * 0.3), 4);
    let stairLen = Math.max(Math.floor(remainLen * 0.38), 5);
    let bath2Len = remainLen - bath1Len - stairLen;
    if (bath2Len < 3) {
      bath1Len = Math.floor(remainLen * 0.28);
      stairLen = Math.floor(remainLen * 0.34);
      bath2Len = remainLen - bath1Len - stairLen;
    }

    // Left Column (Width >= 12'-0" to 14'-0"):
    // 1. Double-Height Void
    fRooms.push({
      id: `${prefix}-void`,
      name: 'Double-Height Void & Mezzanine Gallery (Open to Living Below)',
      x: originX,
      y: originY,
      width: leftColWidth,
      length: voidLen,
      doors: [{ id: `${prefix}-vd`, wall: 'right', offset: 2.5, width: 3.0 }],
      windows: [{ id: `${prefix}-vw`, wall: 'top', offset: 2.5, width: Math.min(leftColWidth - 2, 5.0) }],
    });

    // 2. Executive Master Suite 1
    fRooms.push({
      id: `${prefix}-master1`,
      name: 'Executive Master Suite 1 (with Walk-in Dresser)',
      x: originX,
      y: originY + voidLen,
      width: leftColWidth,
      length: suite1Len,
      doors: [
        { id: `${prefix}-m1d`, wall: 'right', offset: 2.5, width: 3.0 },
        { id: `${prefix}-m1bd`, wall: 'right', offset: Math.max(suite1Len - 3, 2), width: 2.5 },
      ],
      windows: [{ id: `${prefix}-m1w`, wall: 'left', offset: 3, width: 4.0 }],
    });

    // 3. Executive Master Suite 2
    fRooms.push({
      id: `${prefix}-master2`,
      name: 'Executive Master Suite 2 (with Private Balcony)',
      x: originX,
      y: originY + voidLen + suite1Len,
      width: leftColWidth,
      length: suite2Len,
      doors: [
        { id: `${prefix}-m2d`, wall: 'right', offset: 2.5, width: 3.0 },
        { id: `${prefix}-m2bd`, wall: 'right', offset: Math.max(suite2Len - 3, 2), width: 2.5 },
      ],
      windows: [
        { id: `${prefix}-m2w`, wall: 'bottom', offset: 2.5, width: Math.min(leftColWidth - 2, 4.5) },
        { id: `${prefix}-m2w-side`, wall: 'left', offset: 3, width: 4.0 },
      ],
    });

    // Right Column (Width >= 6.5' to 8.0' - full column width for each zone sequentially!):
    // 4. Upper Family Lounge & TV Gallery
    fRooms.push({
      id: `${prefix}-lounge`,
      name: 'Upper Family Lounge & TV Gallery',
      x: originX + leftColWidth,
      y: originY,
      width: rightColWidth,
      length: voidLen,
      doors: [{ id: `${prefix}-ld`, wall: 'left', offset: 2, width: 3.0 }],
      windows: [{ id: `${prefix}-lw`, wall: 'right', offset: 2, width: 3.0 }],
    });

    // 5. Attached Luxury Master Bath 1
    fRooms.push({
      id: `${prefix}-masterbath1`,
      name: 'Attached Luxury Master Bath 1',
      x: originX + leftColWidth,
      y: originY + voidLen,
      width: rightColWidth,
      length: bath1Len,
      doors: [{ id: `${prefix}-b1d`, wall: 'left', offset: 1.5, width: 2.5 }],
      windows: [{ id: `${prefix}-b1w`, wall: 'right', offset: 1.5, width: 2.0 }],
    });

    // 6. Main Staircase & Lift Core Lobby
    fRooms.push({
      id: `${prefix}-staircore`,
      name: 'Main Staircase & Lift Core Lobby',
      x: originX + leftColWidth,
      y: originY + voidLen + bath1Len,
      width: rightColWidth,
      length: stairLen,
      doors: [{ id: `${prefix}-sd`, wall: 'left', offset: 1.5, width: 3.0 }],
      windows: [{ id: `${prefix}-sw`, wall: 'right', offset: 1.5, width: 2.5 }],
    });

    // 7. Attached Luxury Master Bath 2
    fRooms.push({
      id: `${prefix}-masterbath2`,
      name: 'Attached Luxury Master Bath 2',
      x: originX + leftColWidth,
      y: originY + voidLen + bath1Len + stairLen,
      width: rightColWidth,
      length: bath2Len,
      doors: [{ id: `${prefix}-b2d`, wall: 'left', offset: 1.5, width: 2.5 }],
      windows: [{ id: `${prefix}-b2w`, wall: 'right', offset: 1.5, width: 2.0 }],
    });

    return { level: lvl, floorName: 'Fourth Floor (Duplex Upper Level)', rooms: fRooms };
  };

  const generatePenthouseFloor = (lvl: number): FloorPlan => {
    const fRooms: Room[] = [];
    const prefix = `f${lvl}`;

    const terraceLen = Math.max(Math.floor(buildableLength * 0.4), 6);
    const rearLen = buildableLength - terraceLen;
    const masterLen = Math.max(Math.floor(rearLen * 0.65), 5);
    const bathLen = rearLen - masterLen;

    const stairLen = Math.max(Math.floor(rearLen * 0.55), 4);
    const powderLen = rearLen - stairLen;

    // Left Column (Width >= 12'-0" to 14'-0"):
    // 1. Open Sky Landscaped Terrace Garden
    fRooms.push({
      id: `${prefix}-terrace`,
      name: 'Open Sky Landscaped Terrace Garden',
      x: originX,
      y: originY,
      width: leftColWidth,
      length: terraceLen,
      doors: [{ id: `${prefix}-td`, wall: 'bottom', offset: Math.floor(leftColWidth / 2), width: 4.0 }],
      windows: [],
    });

    // 2. Spacious Penthouse Master Suite
    fRooms.push({
      id: `${prefix}-master-suite`,
      name: 'Spacious Penthouse Master Suite',
      x: originX,
      y: originY + terraceLen,
      width: leftColWidth,
      length: masterLen,
      doors: [
        { id: `${prefix}-pd-terrace`, wall: 'top', offset: Math.floor(leftColWidth / 2), width: 4.0 },
        { id: `${prefix}-pd-bath`, wall: 'bottom', offset: 2.0, width: 2.5 },
        { id: `${prefix}-pd-core`, wall: 'right', offset: 2.0, width: 3.0 },
      ],
      windows: [
        { id: `${prefix}-pw-side`, wall: 'left', offset: 3, width: 4.0 },
      ],
    });

    // 3. Attached Luxury Spa Bath & Dressing Room
    fRooms.push({
      id: `${prefix}-master-bath`,
      name: 'Attached Luxury Spa Bath & Dressing Room',
      x: originX,
      y: originY + terraceLen + masterLen,
      width: leftColWidth,
      length: bathLen,
      doors: [{ id: `${prefix}-pbd`, wall: 'top', offset: 2.0, width: 2.5 }],
      windows: [{ id: `${prefix}-pbw`, wall: 'bottom', offset: 2.0, width: 3.0 }],
    });

    // Right Column (Width >= 6.5' to 8.0' - full column width for each zone sequentially!):
    // 4. Covered Cocktail Bar Counter & Pergola Sit-out
    fRooms.push({
      id: `${prefix}-bar`,
      name: 'Covered Cocktail Bar Counter & Pergola Sit-out',
      x: originX + leftColWidth,
      y: originY,
      width: rightColWidth,
      length: terraceLen,
      doors: [{ id: `${prefix}-bard`, wall: 'left', offset: 2.0, width: 3.0 }],
      windows: [{ id: `${prefix}-barw`, wall: 'right', offset: 2.0, width: 3.0 }],
    });

    // 5. Staircase Mumty & Lift Machine Room Core
    fRooms.push({
      id: `${prefix}-core`,
      name: 'Staircase Mumty & Lift Machine Room Core',
      x: originX + leftColWidth,
      y: originY + terraceLen,
      width: rightColWidth,
      length: stairLen,
      doors: [{ id: `${prefix}-core-d`, wall: 'left', offset: 1.5, width: 3.0 }],
      windows: [{ id: `${prefix}-core-w`, wall: 'right', offset: 1.5, width: 2.5 }],
    });

    // 6. Terrace Powder Room & Bar Washroom
    fRooms.push({
      id: `${prefix}-powder`,
      name: 'Terrace Powder Room & Bar Washroom',
      x: originX + leftColWidth,
      y: originY + terraceLen + stairLen,
      width: rightColWidth,
      length: powderLen,
      doors: [{ id: `${prefix}-pwd`, wall: 'left', offset: 1.5, width: 2.5 }],
      windows: [{ id: `${prefix}-pww`, wall: 'right', offset: 1.5, width: 2.0 }],
    });

    return { level: lvl, floorName: 'Fifth Floor (Penthouse & Sky Bar Terrace)', rooms: fRooms };
  };

  // 3. GROUND FLOOR (Level 0)
  if (isStiltParkingGround) {
    const gardenLength = 6; // Exact 6*20 as requested by user
    const gardenWidth = buildableWidth; // 20' exact buildable width
    const parkingLength = buildableLength - gardenLength;
    const stiltCoreWidth = rightColWidth; // e.g. 7'
    const parkingWidth = leftColWidth; // e.g. 13'
    const washroomLen = Math.min(Math.max(Math.floor(parkingLength * 0.25), 6.0), 7.5);
    const coreLen = parkingLength - washroomLen;

    const groundRooms: Room[] = [
      {
        id: 'g-stilt-parking',
        name: 'Covered Stilt Car Parking & Vehicle Driveway',
        x: originX,
        y: originY,
        width: parkingWidth,
        length: parkingLength,
        doors: [{ id: 'gd-stilt-gate', wall: 'top', offset: 2.5, width: Math.min(parkingWidth - 2, 8.0) }],
        windows: [],
      },
      {
        id: 'g-stair-core',
        name: 'Staircase Core & High-Speed Lift Lobby',
        x: originX + parkingWidth,
        y: originY,
        width: stiltCoreWidth,
        length: coreLen,
        doors: [{ id: 'gd-core-in', wall: 'left', offset: 2.5, width: 3.0 }],
        windows: [{ id: 'gw-core-side', wall: 'right', offset: 2.5, width: 2.5 }],
      },
      {
        id: 'g-guard-washroom',
        name: 'Driver / Guard Washroom & Powder Toilet',
        x: originX + parkingWidth,
        y: originY + coreLen,
        width: stiltCoreWidth,
        length: washroomLen,
        doors: [{ id: 'gd-wash-in', wall: 'left', offset: 1.5, width: 2.5 }],
        windows: [{ id: 'gw-wash-vent', wall: 'right', offset: 1.5, width: 2.0 }],
      },
      {
        id: 'g-rear-garden',
        name: `Backyard Landscaped Garden Lawn (${gardenLength}' × ${gardenWidth}')`,
        x: originX,
        y: originY + parkingLength,
        width: gardenWidth,
        length: gardenLength,
        doors: [{ id: 'gd-garden-out', wall: 'top', offset: Math.floor(gardenWidth / 2), width: 3.0 }],
        windows: [],
      },
    ];

    floors.push({ level: 0, floorName: 'Ground Floor (Stilt Parking & Rear Garden)', rooms: groundRooms });
  } else {
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

    // Mid zone: Dining Hall + Modular Kitchen + Pooja
    groundRooms.push({
      id: 'g-dining',
      name: 'Central Dining Hall',
      x: originX,
      y: originY + frontZoneLength,
      width: leftColWidth,
      length: midZoneLength,
      doors: [{ id: 'gd-dining', wall: 'right', offset: 2, width: 3.0 }],
      windows: [{ id: 'gw-dining', wall: 'left', offset: 3, width: 4.0 }],
    });

    if (hasPooja && rightColWidth >= 10) {
      const poojaWidth = Math.min(Math.max(Math.floor(rightColWidth * 0.35), 4), 6);
      const kitchenWidth = rightColWidth - poojaWidth;

      groundRooms.push({
        id: 'g-kitchen',
        name: wantsOpenKitchen ? 'Open Modular Kitchen & Island' : 'Modular Kitchen & Pantry',
        x: originX + leftColWidth,
        y: originY + frontZoneLength,
        width: kitchenWidth,
        length: midZoneLength,
        doors: [{ id: 'gd-kitchen', wall: 'left', offset: 2, width: 3.0 }],
        windows: [{ id: 'gw-kitchen', wall: 'right', offset: 2, width: 4.0 }],
      });

      groundRooms.push({
        id: 'g-pooja',
        name: 'Pooja Room (Mandir)',
        x: originX + leftColWidth + kitchenWidth,
        y: originY + frontZoneLength,
        width: poojaWidth,
        length: midZoneLength,
        doors: [{ id: 'gd-pooja', wall: 'left', offset: 1.5, width: 2.5 }],
        windows: [{ id: 'gw-pooja', wall: 'top', offset: 1.5, width: 2.5 }],
      });
    } else {
      groundRooms.push({
        id: 'g-kitchen',
        name: wantsOpenKitchen ? 'Open Modular Kitchen & Island' : 'Modular Kitchen & Pantry',
        x: originX + leftColWidth,
        y: originY + frontZoneLength,
        width: rightColWidth,
        length: midZoneLength,
        doors: [{ id: 'gd-kitchen', wall: 'left', offset: 2, width: 3.0 }],
        windows: [{ id: 'gw-kitchen', wall: 'right', offset: 2, width: 4.0 }],
      });
    }

    // Rear zone: Ground Floor Bedroom + Attached Bath + Staircase Lobby
    groundRooms.push({
      id: 'g-bed1',
      name: 'Ground Bedroom (Guest/Parents)',
      x: originX,
      y: originY + frontZoneLength + midZoneLength,
      width: leftColWidth,
      length: rearZoneLength,
      doors: [{ id: 'gd-bed1', wall: 'top', offset: 2, width: 3.0 }],
      windows: [{ id: 'gw-bed1', wall: 'bottom', offset: 3, width: 4.0 }],
    });

    const bathWidth = Math.min(Math.max(Math.floor(rightColWidth * 0.44), 5), 7);
    const stairWidth = rightColWidth - bathWidth;

    groundRooms.push({
      id: 'g-bath1',
      name: 'Attached Bathroom & Toilet',
      x: originX + leftColWidth,
      y: originY + frontZoneLength + midZoneLength,
      width: bathWidth,
      length: rearZoneLength,
      doors: [{ id: 'gd-bath1', wall: 'left', offset: 2, width: 2.5 }],
      windows: [{ id: 'gw-bath1', wall: 'bottom', offset: 1.5, width: 2.5 }],
    });

    groundRooms.push({
      id: 'g-stair',
      name: 'Staircase Lobby & Powder Room',
      x: originX + leftColWidth + bathWidth,
      y: originY + frontZoneLength + midZoneLength,
      width: stairWidth,
      length: rearZoneLength,
      doors: [{ id: 'gd-stair', wall: 'top', offset: 1.5, width: 3.0 }],
      windows: [{ id: 'gw-stair', wall: 'right', offset: 2, width: 3.0 }],
    });

    floors.push({ level: 0, floorName: 'Ground Floor Plan', rooms: groundRooms });
  }

  // 4. FIRST FLOOR (Level 1)
  if (floorsCount >= 2) {
    if (isFourRoomFloor) {
      floors.push(generateMasterSuitesFloor(1, 'First Floor Plan (Master Suites 1 & 2)', 1));
    } else {
      const fBalconyLength = Math.max(Math.floor(frontZoneLength * 0.45), 5);
      const fBathLength = frontZoneLength - fBalconyLength;
      const bathLen = Math.min(Math.max(Math.floor(rearZoneLength * 0.45), 6.5), 7.5);
      const stairLen = rearZoneLength - bathLen;

      const firstRooms: Room[] = [
        {
          id: 'f-master',
          name: 'Master Bedroom Suite',
          x: originX,
          y: originY,
          width: leftColWidth,
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
          x: originX + leftColWidth,
          y: originY,
          width: rightColWidth,
          length: fBalconyLength,
          doors: [{ id: 'fd-balc', wall: 'left', offset: 1.5, width: 3.0 }],
          windows: [],
        },
        {
          id: 'f-mbath',
          name: 'Walk-in Dress & Master Bath',
          x: originX + leftColWidth,
          y: originY + fBalconyLength,
          width: rightColWidth,
          length: fBathLength,
          doors: [{ id: 'fd-mbath', wall: 'left', offset: 2, width: 2.5 }],
          windows: [{ id: 'fw-mbath', wall: 'right', offset: 2, width: 3.0 }],
        },
        {
          id: 'f-lounge',
          name: 'Family Lounge & TV Lobby',
          x: originX,
          y: originY + frontZoneLength,
          width: leftColWidth,
          length: midZoneLength,
          doors: [{ id: 'fd-lounge', wall: 'right', offset: 2, width: 3.0 }],
          windows: [{ id: 'fw-lounge', wall: 'left', offset: 2, width: 4.0 }],
        },
        {
          id: 'f-bed2',
          name: "Kids' / Children Bedroom",
          x: originX + leftColWidth,
          y: originY + frontZoneLength,
          width: rightColWidth,
          length: midZoneLength,
          doors: [{ id: 'fd-bed2', wall: 'left', offset: 2, width: 3.0 }],
          windows: [{ id: 'fw-bed2', wall: 'right', offset: 3, width: 4.0 }],
        },
        {
          id: 'f-bed3',
          name: bedroomsCount >= 3 ? 'Bedroom 3 (Guest Suite)' : wantsStudy ? 'Executive Study & Home Office' : 'Bedroom 3 (Guest Suite)',
          x: originX,
          y: originY + frontZoneLength + midZoneLength,
          width: leftColWidth,
          length: rearZoneLength,
          doors: [{ id: 'fd-bed3', wall: 'top', offset: 2, width: 3.0 }],
          windows: [{ id: 'fw-bed3', wall: 'bottom', offset: 3, width: 4.0 }],
        },
        {
          id: 'f-bath2',
          name: 'Attached Bathroom & Toilet',
          x: originX + leftColWidth,
          y: originY + frontZoneLength + midZoneLength,
          width: rightColWidth,
          length: bathLen,
          doors: [{ id: 'fd-bath2', wall: 'left', offset: 2, width: 2.5 }],
          windows: [{ id: 'fw-bath2', wall: 'right', offset: 1.5, width: 2.5 }],
        },
        {
          id: 'f-stair',
          name: 'Staircase Core',
          x: originX + leftColWidth,
          y: originY + frontZoneLength + midZoneLength + bathLen,
          width: rightColWidth,
          length: stairLen,
          doors: [{ id: 'fd-stair', wall: 'left', offset: 1.5, width: 3.0 }],
          windows: [{ id: 'fw-stair', wall: 'right', offset: 2, width: 3.0 }],
        },
      ];
      floors.push({ level: 1, floorName: 'First Floor Plan', rooms: firstRooms });
    }
  }

  // 5. SECOND FLOOR (Level 2)
  if (floorsCount >= 3) {
    if (isFourRoomFloor) {
      floors.push(generateMasterSuitesFloor(2, 'Second Floor Plan (Master Suites 3 & 4)', 3));
    } else {
      const bathWidth = Math.min(Math.max(Math.floor(rightColWidth * 0.44), 5), 7);
      const sRoomName = wantsGym ? 'Fitness Gym & Yoga Room' : wantsTheatre ? 'Private Home Theatre & Media Hall' : 'Executive Study & Home Office';

      const secondRooms: Room[] = [
        {
          id: 's-office',
          name: sRoomName,
          x: originX,
          y: originY,
          width: leftColWidth,
          length: frontZoneLength,
          doors: [{ id: 'sd-off', wall: 'bottom', offset: 3, width: 3.0 }],
          windows: [{ id: 'sw-off', wall: 'top', offset: 3, width: 5.0 }],
        },
        {
          id: 's-terrace',
          name: 'Open Sky Terrace Garden',
          x: originX + leftColWidth,
          y: originY,
          width: rightColWidth,
          length: frontZoneLength + midZoneLength,
          doors: [{ id: 'sd-terrace', wall: 'left', offset: 4, width: 3.0 }],
          windows: [],
        },
        {
          id: 's-bed4',
          name: bedroomsCount >= 4 ? 'Guest Penthouse Bedroom' : wantsTheatre ? 'Dolby Cinema Lounge' : 'Guest Penthouse Bedroom',
          x: originX,
          y: originY + frontZoneLength,
          width: leftColWidth,
          length: midZoneLength,
          doors: [{ id: 'sd-bed4', wall: 'top', offset: 2, width: 3.0 }],
          windows: [{ id: 'sw-bed4', wall: 'left', offset: 2, width: 4.0 }],
        },
        {
          id: 's-bath3',
          name: 'Terrace Bathroom & Powder',
          x: originX,
          y: originY + frontZoneLength + midZoneLength,
          width: bathWidth,
          length: rearZoneLength,
          doors: [{ id: 'sd-bath3', wall: 'top', offset: 2, width: 2.5 }],
          windows: [{ id: 'sw-bath3', wall: 'bottom', offset: 1.5, width: 2.5 }],
        },
        {
          id: 's-lounge',
          name: 'Pantry & Bar Counter',
          x: originX + bathWidth,
          y: originY + frontZoneLength + midZoneLength,
          width: leftColWidth - bathWidth,
          length: rearZoneLength,
          doors: [{ id: 'sd-bar', wall: 'top', offset: 2, width: 2.5 }],
          windows: [{ id: 'sw-bar', wall: 'bottom', offset: 1.5, width: 3.0 }],
        },
        {
          id: 's-stair',
          name: 'Staircase Mumty & Overhead Tank',
          x: originX + leftColWidth,
          y: originY + frontZoneLength + midZoneLength,
          width: rightColWidth,
          length: rearZoneLength,
          doors: [{ id: 'sd-stair', wall: 'top', offset: 1.5, width: 3.0 }],
          windows: [{ id: 'sw-stair', wall: 'right', offset: 2, width: 3.0 }],
        },
      ];
      floors.push({ level: 2, floorName: 'Second Floor Plan', rooms: secondRooms });
    }
  }

  // 6. THIRD FLOOR (Level 3)
  if (floorsCount >= 4) {
    if (isDuplexBuilding && floorsCount >= 5) {
      floors.push(generateDuplexLowerFloor(3));
    } else {
      const nthRooms: Room[] = [
        {
          id: 'f3-suite',
          name: 'Floor 3 Master Apartment Suite',
          x: originX,
          y: originY,
          width: leftColWidth,
          length: frontZoneLength + midZoneLength,
          doors: [{ id: 'f3-d1', wall: 'right', offset: 4, width: 3.0 }],
          windows: [{ id: 'f3-w1', wall: 'top', offset: 3, width: 5.0 }],
        },
        {
          id: 'f3-balc',
          name: 'Floor 3 Panoramic Balcony',
          x: originX + leftColWidth,
          y: originY,
          width: rightColWidth,
          length: Math.max(Math.floor(frontZoneLength * 0.6), 6),
          doors: [{ id: 'f3-d2', wall: 'left', offset: 2, width: 3.0 }],
          windows: [],
        },
        {
          id: 'f3-bath',
          name: 'Floor 3 Attached Bathroom',
          x: originX + leftColWidth,
          y: originY + Math.max(Math.floor(frontZoneLength * 0.6), 6),
          width: rightColWidth,
          length: frontZoneLength + midZoneLength - Math.max(Math.floor(frontZoneLength * 0.6), 6),
          doors: [{ id: 'f3-d3', wall: 'left', offset: 2, width: 2.5 }],
          windows: [{ id: 'f3-w2', wall: 'right', offset: 2, width: 3.0 }],
        },
        {
          id: 'f3-lounge',
          name: 'Floor 3 Multi-Purpose Living & Dining',
          x: originX,
          y: originY + frontZoneLength + midZoneLength,
          width: leftColWidth,
          length: rearZoneLength,
          doors: [{ id: 'f3-d4', wall: 'top', offset: 3, width: 3.0 }],
          windows: [{ id: 'f3-w3', wall: 'bottom', offset: 3, width: 4.0 }],
        },
        {
          id: 'f3-stair',
          name: 'Staircase Tower',
          x: originX + leftColWidth,
          y: originY + frontZoneLength + midZoneLength,
          width: rightColWidth,
          length: rearZoneLength,
          doors: [{ id: 'f3-d5', wall: 'top', offset: 1.5, width: 3.0 }],
          windows: [{ id: 'f3-w4', wall: 'right', offset: 2, width: 3.0 }],
        },
      ];
      floors.push({
        level: 3,
        floorName: floorsCount === 4 ? 'Top Floor (Level 3)' : 'Third Floor Plan',
        rooms: nthRooms,
      });
    }
  }

  // 7. FOURTH FLOOR (Level 4)
  if (floorsCount >= 5) {
    if (isDuplexBuilding) {
      floors.push(generateDuplexUpperFloor(4));
    } else {
      const nthRooms: Room[] = [
        {
          id: 'f4-suite',
          name: 'Floor 4 Executive Penthouse Suite',
          x: originX,
          y: originY,
          width: leftColWidth,
          length: frontZoneLength + midZoneLength,
          doors: [{ id: 'f4-d1', wall: 'right', offset: 4, width: 3.0 }],
          windows: [{ id: 'f4-w1', wall: 'top', offset: 3, width: 5.0 }],
        },
        {
          id: 'f4-balc',
          name: 'Floor 4 Sky Balcony',
          x: originX + leftColWidth,
          y: originY,
          width: rightColWidth,
          length: Math.max(Math.floor(frontZoneLength * 0.6), 6),
          doors: [{ id: 'f4-d2', wall: 'left', offset: 2, width: 3.0 }],
          windows: [],
        },
        {
          id: 'f4-bath',
          name: 'Floor 4 Attached Bathroom',
          x: originX + leftColWidth,
          y: originY + Math.max(Math.floor(frontZoneLength * 0.6), 6),
          width: rightColWidth,
          length: frontZoneLength + midZoneLength - Math.max(Math.floor(frontZoneLength * 0.6), 6),
          doors: [{ id: 'f4-d3', wall: 'left', offset: 2, width: 2.5 }],
          windows: [{ id: 'f4-w2', wall: 'right', offset: 2, width: 3.0 }],
        },
        {
          id: 'f4-lounge',
          name: 'Floor 4 Private Lounge',
          x: originX,
          y: originY + frontZoneLength + midZoneLength,
          width: leftColWidth,
          length: rearZoneLength,
          doors: [{ id: 'f4-d4', wall: 'top', offset: 3, width: 3.0 }],
          windows: [{ id: 'f4-w3', wall: 'bottom', offset: 3, width: 4.0 }],
        },
        {
          id: 'f4-stair',
          name: 'Staircase Tower',
          x: originX + leftColWidth,
          y: originY + frontZoneLength + midZoneLength,
          width: rightColWidth,
          length: rearZoneLength,
          doors: [{ id: 'f4-d5', wall: 'top', offset: 1.5, width: 3.0 }],
          windows: [{ id: 'f4-w4', wall: 'right', offset: 2, width: 3.0 }],
        },
      ];
      floors.push({
        level: 4,
        floorName: 'Fourth Floor Plan',
        rooms: nthRooms,
      });
    }
  }

  // 8. FIFTH FLOOR (Level 5)
  if (floorsCount >= 6) {
    if (hasPenthouseTop || floorsCount === 6) {
      floors.push(generatePenthouseFloor(5));
    } else {
      const nthRooms: Room[] = [
        {
          id: 'f5-suite',
          name: 'Floor 5 Master Suite',
          x: originX,
          y: originY,
          width: leftColWidth,
          length: frontZoneLength + midZoneLength,
          doors: [{ id: 'f5-d1', wall: 'right', offset: 4, width: 3.0 }],
          windows: [{ id: 'f5-w1', wall: 'top', offset: 3, width: 5.0 }],
        },
        {
          id: 'f5-terrace',
          name: 'Floor 5 Open Sky Terrace',
          x: originX + leftColWidth,
          y: originY,
          width: rightColWidth,
          length: frontZoneLength + midZoneLength,
          doors: [{ id: 'f5-d2', wall: 'left', offset: 2, width: 3.0 }],
          windows: [],
        },
        {
          id: 'f5-bath',
          name: 'Floor 5 Spa Bathroom',
          x: originX,
          y: originY + frontZoneLength + midZoneLength,
          width: leftColWidth,
          length: rearZoneLength,
          doors: [{ id: 'f5-d3', wall: 'top', offset: 2, width: 2.5 }],
          windows: [{ id: 'f5-w2', wall: 'bottom', offset: 2, width: 3.0 }],
        },
        {
          id: 'f5-core',
          name: 'Staircase Mumty Core',
          x: originX + leftColWidth,
          y: originY + frontZoneLength + midZoneLength,
          width: rightColWidth,
          length: rearZoneLength,
          doors: [{ id: 'f5-d4', wall: 'top', offset: 1.5, width: 3.0 }],
          windows: [{ id: 'f5-w3', wall: 'right', offset: 2, width: 3.0 }],
        },
      ];
      floors.push({
        level: 5,
        floorName: 'Fifth Floor Plan',
        rooms: nthRooms,
      });
    }
  }

  // 9. ADDITIONAL FLOORS (If floors >= 7)
  for (let lvl = 6; lvl < floorsCount; lvl++) {
    const nthRooms: Room[] = [
      {
        id: `f${lvl}-suite`,
        name: `Floor ${lvl} Master Apartment Suite`,
        x: originX,
        y: originY,
        width: leftColWidth,
        length: frontZoneLength + midZoneLength,
        doors: [{ id: `f${lvl}-d1`, wall: 'right', offset: 4, width: 3.0 }],
        windows: [{ id: `f${lvl}-w1`, wall: 'top', offset: 3, width: 5.0 }],
      },
      {
        id: `f${lvl}-balc`,
        name: `Floor ${lvl} Panoramic Balcony`,
        x: originX + leftColWidth,
        y: originY,
        width: rightColWidth,
        length: Math.max(Math.floor(frontZoneLength * 0.6), 6),
        doors: [{ id: `f${lvl}-d2`, wall: 'left', offset: 2, width: 3.0 }],
        windows: [],
      },
      {
        id: `f${lvl}-bath`,
        name: `Floor ${lvl} Attached Bathroom`,
        x: originX + leftColWidth,
        y: originY + Math.max(Math.floor(frontZoneLength * 0.6), 6),
        width: rightColWidth,
        length: frontZoneLength + midZoneLength - Math.max(Math.floor(frontZoneLength * 0.6), 6),
        doors: [{ id: `f${lvl}-d3`, wall: 'left', offset: 2, width: 2.5 }],
        windows: [{ id: `f${lvl}-w2`, wall: 'right', offset: 2, width: 3.0 }],
      },
      {
        id: `f${lvl}-lounge`,
        name: `Floor ${lvl} Multi-Purpose Living & Dining`,
        x: originX,
        y: originY + frontZoneLength + midZoneLength,
        width: leftColWidth,
        length: rearZoneLength,
        doors: [{ id: `f${lvl}-d4`, wall: 'top', offset: 3, width: 3.0 }],
        windows: [{ id: `f${lvl}-w3`, wall: 'bottom', offset: 3, width: 4.0 }],
      },
      {
        id: `f${lvl}-stair`,
        name: 'Staircase Tower',
        x: originX + leftColWidth,
        y: originY + frontZoneLength + midZoneLength,
        width: rightColWidth,
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
  const effectiveReqs = formData.customWishlist
    ? extractRequirementsFromPrompt(formData.customWishlist, formData.requirements)
    : formData.requirements;

  const plotArea = formData.plot.width * formData.plot.length;
  const setbacks = rules.getSetbacksForPlot(plotArea);
  const buildableWidth = Math.max(formData.plot.width - (setbacks.sideMinFt * 2), 12);
  const buildableLength = Math.max(formData.plot.length - setbacks.frontMinFt - setbacks.rearMinFt, 16);
  const builtUpAreaPerFloor = Math.max(Math.round(buildableWidth * buildableLength), 100);
  const totalBuiltUpArea = builtUpAreaPerFloor * Math.max(effectiveReqs.floors, 1);
  const boq = calculateDetailedBOQ(totalBuiltUpArea, formData.plot.city, formData.budget.qualityTier);

  const floors = generateDynamicArchitecturalFloors({
    plotWidth: formData.plot.width,
    plotLength: formData.plot.length,
    buildableWidth,
    buildableLength,
    originX: setbacks.sideMinFt,
    originY: setbacks.frontMinFt,
    floorsCount: Math.max(effectiveReqs.floors, 1),
    bedroomsCount: effectiveReqs.bedrooms,
    bathroomsCount: effectiveReqs.bathrooms,
    hasPooja: effectiveReqs.hasPoojaRoom,
    hasParking: effectiveReqs.parkingSpots > 0,
    hasTerrace: effectiveReqs.hasTerrace,
    hasBasement: effectiveReqs.hasBasement,
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
