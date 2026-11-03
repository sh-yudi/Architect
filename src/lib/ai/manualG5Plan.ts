import { HousePlan, FloorPlan, Room } from '@/types/plan';
import { calculateDetailedBOQ } from '@/lib/rates/calculator';

/**
 * Creates the exact verified manual G+5 architectural plan matching the user's brief:
 * - Ground Floor: 6x20 rear garden, covered stilt parking, driver washroom, staircase & express lift foyer.
 * - 1st & 2nd Floors: 4 separate rooms with attached bathrooms, divided horizontally in half by a central staircase lobby.
 *   Express lift passes through (does NOT open on 1st & 2nd floors).
 * - 3rd & 4th Floors: Duplex with direct-opening express lift, 20ft double-height drawing room, kitchen, guest room, 2 master suites.
 * - 5th Floor: Penthouse master suite with open sky terrace and covered pergola cocktail bar.
 * - Rear 6x20 Garden is Open-To-Sky (OTS) from Ground to Sky/Roof.
 */
export function getManualG5Plan(): HousePlan {
  const plotWidth = 20;
  const plotLength = 45;
  const plotArea = plotWidth * plotLength; // 900 sq ft

  const gardenDepth = 6;
  const buildingDepth = plotLength - gardenDepth; // 39 ft
  const frontDepth = 14.0;
  const middleCoreDepth = 9.0;
  const rearDepth = buildingDepth - frontDepth - middleCoreDepth; // 16.0 ft

  // ==========================================
  // LEVEL 0: GROUND FLOOR (Stilt Parking & Rear Garden)
  // ==========================================
  const groundRooms: Room[] = [
    {
      id: 'g-stilt-parking',
      name: 'Covered Stilt Car Parking Bay (2-3 SUVs & EV Station)',
      x: 0,
      y: 0,
      width: 13,
      length: buildingDepth,
      doors: [{ id: 'gd-gate', wall: 'top', offset: 2.5, width: 8.0 }],
      windows: [],
    },
    {
      id: 'g-entry-foyer',
      name: 'Staircase Entry & Express Lift Lobby Foyer',
      x: 13,
      y: 0,
      width: 7,
      length: buildingDepth - 7.0,
      doors: [{ id: 'gd-core-in', wall: 'left', offset: 3.0, width: 3.5 }],
      windows: [{ id: 'gw-core', wall: 'right', offset: 3.0, width: 2.5 }],
    },
    {
      id: 'g-guard-washroom',
      name: 'Driver & Security Washroom (Good Size)',
      x: 13,
      y: buildingDepth - 7.0,
      width: 7,
      length: 7.0,
      doors: [{ id: 'gd-wash', wall: 'left', offset: 1.5, width: 2.5 }],
      windows: [{ id: 'gw-wash', wall: 'right', offset: 1.5, width: 2.0 }],
    },
    {
      id: 'g-rear-garden',
      name: "Backyard Landscaped Garden Lawn (6' × 20' - Open to Sky)",
      x: 0,
      y: buildingDepth,
      width: 20,
      length: gardenDepth,
      doors: [{ id: 'gd-garden', wall: 'top', offset: 10, width: 3.5 }],
      windows: [],
    },
  ];

  // ==========================================
  // HELPER: LEVELS 1 & 2 (4 Separate Rooms with Attached Baths & Horizontal Stair Lobby)
  // ==========================================
  const generateFourRoomHorizontalFloor = (lvl: number, floorTitle: string): FloorPlan => {
    const p = `f${lvl}`;
    const rooms: Room[] = [
      // FRONT PART: 2 Separate Rooms with Front Balconies
      {
        id: `${p}-balc-front1`,
        name: `Room 1 Front Balcony`,
        x: 0,
        y: 0,
        width: 10,
        length: 3.0,
        doors: [{ id: `${p}-d-b1`, wall: 'bottom', offset: 5, width: 3.0 }],
        windows: [],
      },
      {
        id: `${p}-room1`,
        name: `Room 1 (Front-Left Suite with Double Bed & TV)`,
        x: 0,
        y: 3.0,
        width: 10,
        length: frontDepth - 3.0,
        doors: [
          { id: `${p}-d-r1`, wall: 'bottom', offset: 3.5, width: 3.0 }, // door to horizontal lobby
          { id: `${p}-d-r1b`, wall: 'bottom', offset: 8.0, width: 2.5 }, // door to attached bath 1
        ],
        windows: [{ id: `${p}-w-r1`, wall: 'top', offset: 3.0, width: 4.0 }],
      },
      {
        id: `${p}-balc-front2`,
        name: `Room 2 Front Balcony`,
        x: 10,
        y: 0,
        width: 10,
        length: 3.0,
        doors: [{ id: `${p}-d-b2`, wall: 'bottom', offset: 5, width: 3.0 }],
        windows: [],
      },
      {
        id: `${p}-room2`,
        name: `Room 2 (Front-Right Suite with Double Bed & TV)`,
        x: 10,
        y: 3.0,
        width: 10,
        length: frontDepth - 3.0,
        doors: [
          { id: `${p}-d-r2`, wall: 'bottom', offset: 3.5, width: 3.0 },
          { id: `${p}-d-r2b`, wall: 'bottom', offset: 8.0, width: 2.5 },
        ],
        windows: [{ id: `${p}-w-r2`, wall: 'top', offset: 3.0, width: 4.0 }],
      },

      // MIDDLE ZONE: Horizontal Stair Lobby Differentiating Front & Back + Express Lift Shaft
      {
        id: `${p}-bath1`,
        name: `Attached Bathroom 1 (Room 1)`,
        x: 0,
        y: frontDepth,
        width: 5,
        length: middleCoreDepth * 0.5,
        doors: [{ id: `${p}-d-b1in`, wall: 'top', offset: 1.5, width: 2.5 }],
        windows: [{ id: `${p}-w-b1vent`, wall: 'left', offset: 1.5, width: 2.0 }],
      },
      {
        id: `${p}-bath3`,
        name: `Attached Bathroom 3 (Room 3)`,
        x: 0,
        y: frontDepth + middleCoreDepth * 0.5,
        width: 5,
        length: middleCoreDepth * 0.5,
        doors: [{ id: `${p}-d-b3in`, wall: 'bottom', offset: 1.5, width: 2.5 }],
        windows: [{ id: `${p}-w-b3vent`, wall: 'left', offset: 1.5, width: 2.0 }],
      },
      {
        id: `${p}-horizontal-lobby`,
        name: `Horizontal Staircase Lobby (Front & Back Divider)`,
        x: 5,
        y: frontDepth,
        width: 10,
        length: middleCoreDepth,
        doors: [
          { id: `${p}-d-cor-f`, wall: 'top', offset: 5.0, width: 3.5 },
          { id: `${p}-d-cor-r`, wall: 'bottom', offset: 5.0, width: 3.5 },
        ],
        windows: [],
      },
      {
        id: `${p}-bath2`,
        name: `Attached Bathroom 2 (Room 2)`,
        x: 15,
        y: frontDepth,
        width: 5,
        length: middleCoreDepth * 0.5,
        doors: [{ id: `${p}-d-b2in`, wall: 'top', offset: 1.5, width: 2.5 }],
        windows: [{ id: `${p}-w-b2vent`, wall: 'right', offset: 1.5, width: 2.0 }],
      },
      {
        id: `${p}-bath4`,
        name: `Attached Bathroom 4 (Room 4)`,
        x: 15,
        y: frontDepth + middleCoreDepth * 0.5,
        width: 5,
        length: middleCoreDepth * 0.5,
        doors: [{ id: `${p}-d-b4in`, wall: 'bottom', offset: 1.5, width: 2.5 }],
        windows: [{ id: `${p}-w-b4vent`, wall: 'right', offset: 1.5, width: 2.0 }],
      },

      // BACK PART: 2 Separate Rooms with Courtyard Balconies
      {
        id: `${p}-room3`,
        name: `Room 3 (Rear-Left Suite with Garden Vista)`,
        x: 0,
        y: frontDepth + middleCoreDepth,
        width: 10,
        length: rearDepth - 3.5,
        doors: [
          { id: `${p}-d-r3`, wall: 'top', offset: 3.5, width: 3.0 },
          { id: `${p}-d-r3b`, wall: 'bottom', offset: 5.0, width: 3.0 },
        ],
        windows: [{ id: `${p}-w-r3`, wall: 'bottom', offset: 2.5, width: 4.0 }],
      },
      {
        id: `${p}-balc-rear3`,
        name: `Room 3 Courtyard Balcony (Overlooking 6×20 Lawn)`,
        x: 0,
        y: buildingDepth - 3.5,
        width: 10,
        length: 3.5,
        doors: [{ id: `${p}-d-br3`, wall: 'top', offset: 5, width: 3.0 }],
        windows: [],
      },
      {
        id: `${p}-room4`,
        name: `Room 4 (Rear-Right Suite with Garden Vista)`,
        x: 10,
        y: frontDepth + middleCoreDepth,
        width: 10,
        length: rearDepth - 3.5,
        doors: [
          { id: `${p}-d-r4`, wall: 'top', offset: 3.5, width: 3.0 },
          { id: `${p}-d-r4b`, wall: 'bottom', offset: 5.0, width: 3.0 },
        ],
        windows: [{ id: `${p}-w-r4`, wall: 'bottom', offset: 2.5, width: 4.0 }],
      },
      {
        id: `${p}-balc-rear4`,
        name: `Room 4 Courtyard Balcony (Overlooking 6×20 Lawn)`,
        x: 10,
        y: buildingDepth - 3.5,
        width: 10,
        length: 3.5,
        doors: [{ id: `${p}-d-br4`, wall: 'top', offset: 5, width: 3.0 }],
        windows: [],
      },

      // 6x20 OTS Rear Garden Shaft (Continuous Vertical Lightwell)
      {
        id: `${p}-ots-garden`,
        name: "Open-to-Sky Garden Void (6' × 20' Open till Sky)",
        x: 0,
        y: buildingDepth,
        width: 20,
        length: gardenDepth,
        doors: [],
        windows: [],
      },
    ];

    return { level: lvl, floorName: floorTitle, rooms };
  };

  // ==========================================
  // LEVEL 3: THIRD FLOOR (Duplex Lower - Direct Lift Entry, Double Height Drawing Room)
  // ==========================================
  const thirdFloorRooms: Room[] = [
    // FRONT PART: Double-Height Grand Drawing Room
    {
      id: 'f3-drawing-balc',
      name: 'Grand Drawing Room Front Balcony',
      x: 0,
      y: 0,
      width: 20,
      length: 3.5,
      doors: [{ id: 'f3-d-fbalc', wall: 'bottom', offset: 10, width: 4.5 }],
      windows: [],
    },
    {
      id: 'f3-drawing-room',
      name: 'Double-Height Grand Formal Drawing & Living Room (20ft Ceiling)',
      x: 0,
      y: 3.5,
      width: 20,
      length: frontDepth - 3.5,
      doors: [{ id: 'f3-d-draw-main', wall: 'bottom', offset: 10, width: 4.0 }],
      windows: [
        { id: 'f3-w-draw-f1', wall: 'top', offset: 3.0, width: 5.0 },
        { id: 'f3-w-draw-f2', wall: 'top', offset: 12.0, width: 5.0 },
      ],
    },

    // MIDDLE ZONE: Direct Express Lift Opening, Horizontal Stairs & Duplex Spiral Connection
    {
      id: 'f3-express-lift-lobby',
      name: 'Direct Express Lift Entrance Lobby & Foyer (From Ground)',
      x: 0,
      y: frontDepth,
      width: 10,
      length: middleCoreDepth,
      doors: [
        { id: 'f3-d-lift-in', wall: 'right', offset: 3.0, width: 3.5 },
        { id: 'f3-d-foyer-out', wall: 'top', offset: 5.0, width: 3.5 },
      ],
      windows: [],
    },
    {
      id: 'f3-duplex-stair-core',
      name: 'Horizontal Staircase & Internal Duplex Floating Stair',
      x: 10,
      y: frontDepth,
      width: 10,
      length: middleCoreDepth,
      doors: [{ id: 'f3-d-stair-acc', wall: 'left', offset: 3.0, width: 3.5 }],
      windows: [{ id: 'f3-w-stair', wall: 'right', offset: 4.0, width: 3.0 }],
    },

    // BACK PART: Kitchen, Dining & Executive Guest Bedroom
    {
      id: 'f3-kitchen',
      name: 'Modular Island Kitchen & Dining Hub',
      x: 0,
      y: frontDepth + middleCoreDepth,
      width: 10,
      length: rearDepth - 3.5,
      doors: [{ id: 'f3-d-kit', wall: 'top', offset: 3.0, width: 3.0 }],
      windows: [{ id: 'f3-w-kit', wall: 'left', offset: 3.0, width: 3.5 }],
    },
    {
      id: 'f3-guest-bed',
      name: 'Executive Guest Bedroom Suite',
      x: 10,
      y: frontDepth + middleCoreDepth,
      width: 10,
      length: rearDepth - 3.5,
      doors: [
        { id: 'f3-d-guest', wall: 'top', offset: 3.0, width: 3.0 },
        { id: 'f3-d-guest-balc', wall: 'bottom', offset: 5.0, width: 3.0 },
      ],
      windows: [{ id: 'f3-w-guest', wall: 'right', offset: 3.0, width: 3.5 }],
    },
    {
      id: 'f3-guest-bath',
      name: 'Attached Guest Bathroom & Powder',
      x: 0,
      y: buildingDepth - 3.5,
      width: 10,
      length: 3.5,
      doors: [{ id: 'f3-d-gbath', wall: 'top', offset: 5.0, width: 2.5 }],
      windows: [{ id: 'f3-w-gbath', wall: 'left', offset: 1.5, width: 2.0 }],
    },
    {
      id: 'f3-guest-balcony',
      name: 'Guest Suite Balcony (Courtyard View)',
      x: 10,
      y: buildingDepth - 3.5,
      width: 10,
      length: 3.5,
      doors: [{ id: 'f3-d-gbalc', wall: 'top', offset: 5.0, width: 3.0 }],
      windows: [],
    },

    // 6x20 OTS Rear Garden Shaft
    {
      id: 'f3-ots-garden',
      name: "Open-to-Sky Garden Void (6' × 20' Open till Sky)",
      x: 0,
      y: buildingDepth,
      width: 20,
      length: gardenDepth,
      doors: [],
      windows: [],
    },
  ];

  // ==========================================
  // LEVEL 4: FOURTH FLOOR (Duplex Upper - Mezzanine Void & 2 Master Suites)
  // ==========================================
  const fourthFloorRooms: Room[] = [
    // FRONT PART: Double-Height Void Overlook & Mezzanine Gallery
    {
      id: 'f4-void',
      name: 'Double-Height Void (Overlooking Formal Drawing Room Below)',
      x: 0,
      y: 0,
      width: 20,
      length: frontDepth - 4.0,
      doors: [],
      windows: [
        { id: 'f4-vw-1', wall: 'top', offset: 4.0, width: 5.0 },
        { id: 'f4-vw-2', wall: 'top', offset: 11.0, width: 5.0 },
      ],
    },
    {
      id: 'f4-mezzanine-lounge',
      name: 'Mezzanine Gallery Bridge & TV Snug (Glass Balustrade)',
      x: 0,
      y: frontDepth - 4.0,
      width: 20,
      length: 4.0,
      doors: [{ id: 'f4-d-bridge', wall: 'bottom', offset: 10, width: 3.5 }],
      windows: [],
    },

    // MIDDLE ZONE: Horizontal Staircase & Lift Core
    {
      id: 'f4-horizontal-core',
      name: 'Horizontal Staircase & Express Lift Lobby',
      x: 0,
      y: frontDepth,
      width: 20,
      length: middleCoreDepth,
      doors: [
        { id: 'f4-d-m1', wall: 'bottom', offset: 4.0, width: 3.0 },
        { id: 'f4-d-m2', wall: 'bottom', offset: 14.0, width: 3.0 },
      ],
      windows: [{ id: 'f4-w-core', wall: 'right', offset: 3.0, width: 3.0 }],
    },

    // BACK PART: 2 Master Suites with Attached Luxury Baths & Courtyard Balconies
    {
      id: 'f4-master1',
      name: 'Master Suite 1 (with Walk-in Dresser)',
      x: 0,
      y: frontDepth + middleCoreDepth,
      width: 10,
      length: rearDepth - 7.0,
      doors: [
        { id: 'f4-d-m1in', wall: 'top', offset: 3.0, width: 3.0 },
        { id: 'f4-d-m1b', wall: 'bottom', offset: 3.0, width: 2.5 },
      ],
      windows: [{ id: 'f4-w-m1', wall: 'left', offset: 3.0, width: 4.0 }],
    },
    {
      id: 'f4-master1-bath',
      name: 'Attached Luxury Master Bath 1',
      x: 0,
      y: buildingDepth - 7.0,
      width: 10,
      length: 3.5,
      doors: [{ id: 'f4-d-b1acc', wall: 'top', offset: 3.0, width: 2.5 }],
      windows: [{ id: 'f4-w-b1vent', wall: 'left', offset: 1.5, width: 2.0 }],
    },
    {
      id: 'f4-master1-balc',
      name: 'Master 1 Private Balcony (Courtyard View)',
      x: 0,
      y: buildingDepth - 3.5,
      width: 10,
      length: 3.5,
      doors: [{ id: 'f4-d-m1balc', wall: 'top', offset: 5.0, width: 3.0 }],
      windows: [],
    },

    {
      id: 'f4-master2',
      name: 'Master Suite 2 (with Private Study Nook)',
      x: 10,
      y: frontDepth + middleCoreDepth,
      width: 10,
      length: rearDepth - 7.0,
      doors: [
        { id: 'f4-d-m2in', wall: 'top', offset: 3.0, width: 3.0 },
        { id: 'f4-d-m2b', wall: 'bottom', offset: 3.0, width: 2.5 },
      ],
      windows: [{ id: 'f4-w-m2', wall: 'right', offset: 3.0, width: 4.0 }],
    },
    {
      id: 'f4-master2-bath',
      name: 'Attached Luxury Master Bath 2',
      x: 10,
      y: buildingDepth - 7.0,
      width: 10,
      length: 3.5,
      doors: [{ id: 'f4-d-b2acc', wall: 'top', offset: 3.0, width: 2.5 }],
      windows: [{ id: 'f4-w-b2vent', wall: 'right', offset: 1.5, width: 2.0 }],
    },
    {
      id: 'f4-master2-balc',
      name: 'Master 2 Private Balcony (Courtyard View)',
      x: 10,
      y: buildingDepth - 3.5,
      width: 10,
      length: 3.5,
      doors: [{ id: 'f4-d-m2balc', wall: 'top', offset: 5.0, width: 3.0 }],
      windows: [],
    },

    // 6x20 OTS Rear Garden Shaft
    {
      id: 'f4-ots-garden',
      name: "Open-to-Sky Garden Void (6' × 20' Open till Sky)",
      x: 0,
      y: buildingDepth,
      width: 20,
      length: gardenDepth,
      doors: [],
      windows: [],
    },
  ];

  // ==========================================
  // LEVEL 5: FIFTH FLOOR (Penthouse Suite, Open Terrace & Cocktail Bar)
  // ==========================================
  const fifthFloorRooms: Room[] = [
    // FRONT PART: Open Sky Landscaped Terrace & Covered Cocktail Bar
    {
      id: 'f5-open-terrace',
      name: 'Open Sky Landscaped Terrace Garden (Turf & Planters)',
      x: 0,
      y: 0,
      width: 13,
      length: frontDepth,
      doors: [{ id: 'f5-d-terrace-out', wall: 'bottom', offset: 6.5, width: 4.0 }],
      windows: [],
    },
    {
      id: 'f5-cocktail-bar',
      name: 'Covered Cocktail Bar Counter & Pergola Sit-out',
      x: 13,
      y: 0,
      width: 7,
      length: frontDepth,
      doors: [{ id: 'f5-d-bar-in', wall: 'left', offset: 4.0, width: 3.0 }],
      windows: [{ id: 'f5-w-bar', wall: 'right', offset: 4.0, width: 3.0 }],
    },

    // MIDDLE ZONE: Express Lift Mumty, Horizontal Stairs & Terrace Restroom
    {
      id: 'f5-penthouse-foyer',
      name: 'Penthouse Foyer & Express Lift Mumty Core',
      x: 0,
      y: frontDepth,
      width: 13,
      length: middleCoreDepth,
      doors: [
        { id: 'f5-d-foyer-terr', wall: 'top', offset: 6.5, width: 3.5 },
        { id: 'f5-d-foyer-bed', wall: 'bottom', offset: 6.5, width: 3.5 },
      ],
      windows: [],
    },
    {
      id: 'f5-terrace-powder',
      name: 'Terrace Powder Room & Bar Store',
      x: 13,
      y: frontDepth,
      width: 7,
      length: middleCoreDepth,
      doors: [{ id: 'f5-d-pow-in', wall: 'left', offset: 3.0, width: 2.5 }],
      windows: [{ id: 'f5-w-pow', wall: 'right', offset: 3.0, width: 2.0 }],
    },

    // BACK PART: Spacious Penthouse Master Suite & Spa Bath
    {
      id: 'f5-penthouse-suite',
      name: 'Spacious Penthouse Master Suite (Grand Bedroom)',
      x: 0,
      y: frontDepth + middleCoreDepth,
      width: 13,
      length: rearDepth - 3.5,
      doors: [
        { id: 'f5-d-pent-in', wall: 'top', offset: 6.5, width: 3.5 },
        { id: 'f5-d-pent-bath', wall: 'right', offset: 4.0, width: 2.5 },
        { id: 'f5-d-pent-balc', wall: 'bottom', offset: 6.5, width: 3.5 },
      ],
      windows: [{ id: 'f5-w-pent', wall: 'left', offset: 4.0, width: 4.5 }],
    },
    {
      id: 'f5-spa-bath',
      name: 'Attached Luxury Spa Bath & Dressing Room (Soaking Tub)',
      x: 13,
      y: frontDepth + middleCoreDepth,
      width: 7,
      length: rearDepth - 3.5,
      doors: [{ id: 'f5-d-spa-in', wall: 'left', offset: 4.0, width: 2.5 }],
      windows: [{ id: 'f5-w-spa', wall: 'right', offset: 4.0, width: 2.5 }],
    },
    {
      id: 'f5-pent-balcony',
      name: 'Penthouse Rear Balcony (Overlooking Vertical Garden)',
      x: 0,
      y: buildingDepth - 3.5,
      width: 20,
      length: 3.5,
      doors: [{ id: 'f5-d-pbalc', wall: 'top', offset: 10, width: 3.5 }],
      windows: [],
    },

    // 6x20 OTS Rear Garden Shaft (Open sky above garden)
    {
      id: 'f5-ots-garden',
      name: "Open-to-Sky Garden Lightwell (Reaches Roof Sky)",
      x: 0,
      y: buildingDepth,
      width: 20,
      length: gardenDepth,
      doors: [],
      windows: [],
    },
  ];

  const floors: FloorPlan[] = [
    { level: 0, floorName: 'Ground Floor (Stilt Parking & 6×20 Garden)', rooms: groundRooms },
    generateFourRoomHorizontalFloor(1, 'First Floor Plan (4 Separate Rooms + 4 Baths)'),
    generateFourRoomHorizontalFloor(2, 'Second Floor Plan (4 Separate Rooms + 4 Baths)'),
    { level: 3, floorName: 'Third Floor (Duplex Lower - Direct Lift Entry)', rooms: thirdFloorRooms },
    { level: 4, floorName: 'Fourth Floor (Duplex Upper - Mezzanine & 2 Suites)', rooms: fourthFloorRooms },
    { level: 5, floorName: 'Fifth Floor (Penthouse Suite, Sky Bar & Terrace)', rooms: fifthFloorRooms },
  ];

  const allRooms = floors.flatMap((f) => f.rooms);
  const totalBuiltUpArea = Math.round(plotWidth * buildingDepth * 6);
  const boq = calculateDetailedBOQ(totalBuiltUpArea, 'Delhi', 'luxury');

  return {
    customWishlist:
      'G+5 luxury residence with stilt parking & 6x20 rear open garden on Ground, 4 separate rooms with attached baths on 1st & 2nd floors with horizontal stair lobby, Duplex on 3rd & 4th floors with direct express lift and double-height drawing room, Penthouse master suite with open sky terrace and cocktail bar on 5th floor.',
    plot: {
      width: plotWidth,
      length: plotLength,
      facing: 'North',
      area: plotArea,
    },
    setbacks: {
      front: 0,
      rear: 0,
      left: 0,
      right: 0,
    },
    floors,
    structural: {
      columns: [
        { id: 'c1', x: 0, y: 0, sizeInches: [9, 15] },
        { id: 'c2', x: 10, y: 0, sizeInches: [9, 15] },
        { id: 'c3', x: 20, y: 0, sizeInches: [9, 15] },
        { id: 'c4', x: 0, y: frontDepth, sizeInches: [9, 15] },
        { id: 'c5', x: 10, y: frontDepth, sizeInches: [9, 15] },
        { id: 'c6', x: 20, y: frontDepth, sizeInches: [9, 15] },
        { id: 'c7', x: 0, y: frontDepth + middleCoreDepth, sizeInches: [9, 15] },
        { id: 'c8', x: 10, y: frontDepth + middleCoreDepth, sizeInches: [9, 15] },
        { id: 'c9', x: 20, y: frontDepth + middleCoreDepth, sizeInches: [9, 15] },
        { id: 'c10', x: 0, y: buildingDepth, sizeInches: [9, 15] },
        { id: 'c11', x: 10, y: buildingDepth, sizeInches: [9, 15] },
        { id: 'c12', x: 20, y: buildingDepth, sizeInches: [9, 15] },
      ],
      beams: [
        { id: 'b1', startColumnId: 'c1', endColumnId: 'c3' },
        { id: 'b2', startColumnId: 'c4', endColumnId: 'c6' },
        { id: 'b3', startColumnId: 'c7', endColumnId: 'c9' },
        { id: 'b4', startColumnId: 'c10', endColumnId: 'c12' },
        { id: 'b5', startColumnId: 'c1', endColumnId: 'c10' },
        { id: 'b6', startColumnId: 'c3', endColumnId: 'c12' },
      ],
      footingType: 'Heavy RCC Isolated & Combined Footing with M25 Concrete (6ft depth)',
      slabType: 'M25 Reinforced 5.5-inch RCC Two-Way Sunken Slab with Fe500D TMT',
    },
    electrical: {
      pointsByRoom: allRooms.map((r) => ({
        roomId: r.id,
        lightPoints: Math.max(Math.floor((r.width * r.length) / 40), 2),
        fanPoints: r.name.toLowerCase().includes('bath') ? 0 : 1,
        powerSockets: Math.max(Math.floor((r.width * r.length) / 45), 2),
      })),
    },
    plumbing: {
      inletPoints: [
        { x: 2, y: frontDepth + 4, type: 'Municipal High-Pressure Water Supply Inlet' },
        { x: 18, y: buildingDepth - 2, type: 'Overhead Gravity Feed Dual Supply Line' },
      ],
      outletPoints: [
        { x: 2, y: plotLength, type: 'Main Sewer 110mm PVC Soil Stack' },
        { x: 18, y: plotLength, type: 'Rainwater Harvesting & Courtyard Drain Gully' },
      ],
    },
    budget: boq,
    facade: {
      style: 'Modern Luxury European Villa Facade',
      features: [
        'Full-Height 20ft Double-Height Structural Glazing Curtain Wall on Duplex Front',
        'Toughened Frameless Glass Balconies with SS 316 Concealed Base Shoes',
        'Terracotta CNC Louvered Privacy Screens along Bedrooms for Solar Shading',
        'Top Pergola Roof with Integrated Warm Architectural Cove Downlighters',
        'Rear Vertical Garden Wall with Automated Drip-Irrigation Manifold',
      ],
      exteriorMaterial: 'Italian Travertine cladding with Asian Paints Apex Ultima weather-shield silicone finish',
    },
    regulatory: {
      far: 3.2,
      groundCoverage: 86.6,
      builtUpArea: totalBuiltUpArea,
      violations: [],
    },
  };
}
