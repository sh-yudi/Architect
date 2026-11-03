import { FloorPlan, Room, StructuralLayout, ColumnDef, BeamDef, PlumbingPoint } from '@/types/plan';
import { formatFeetInches } from '@/components/floorplan/RoomBox';

export interface ArchitecturalPlannerConfig {
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

/**
 * Professional Architectural Layout & Structural Frame Engine
 * Implements National Building Code (NBC) compliant vertical zoning,
 * exact bedroom/bathroom quota distribution, and aligned RCC structural grids.
 */
export function generateArchitecturalLayout(config: ArchitecturalPlannerConfig): {
  floors: FloorPlan[];
  structural: StructuralLayout;
  plumbing: {
    inletPoints: PlumbingPoint[];
    outletPoints: PlumbingPoint[];
  };
} {
  const {
    plotWidth,
    plotLength,
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

  const lowerWish = wishlist.toLowerCase();

  // Zone lengths calculation (Front, Core, Rear)
  // Ensure the vertical circulation core is horizontally positioned to divide front and rear wings
  const frontDepth = Math.max(Math.round(buildableLength * 0.38 * 2) / 2, 11);
  const coreDepth = Math.max(Math.round(buildableLength * 0.24 * 2) / 2, 8);
  const rearDepth = Math.round((buildableLength - frontDepth - coreDepth) * 2) / 2;

  // Horizontal column widths: Left wing and Right wing
  const isNarrowPlot = buildableWidth <= 24;
  const leftWingWidth = isNarrowPlot ? Math.round(buildableWidth * 0.5 * 2) / 2 : Math.round(buildableWidth * 0.55 * 2) / 2;
  const rightWingWidth = buildableWidth - leftWingWidth;

  // Rear garden OTS lightwell depth (if plot has length >= 40ft and garden requested or G+5)
  const hasRearGarden = lowerWish.includes('garden') || lowerWish.includes('lawn') || lowerWish.includes('ots') || floorsCount >= 5;
  const gardenDepth = hasRearGarden && buildableLength >= 32 ? Math.min(6.0, Math.round(buildableLength * 0.15)) : 0;
  const usableRearDepth = rearDepth - gardenDepth;

  // Distribute the exact number of bedrooms across available upper floors
  // Rule: In G+2 to G+5 townhomes, lower floors host arrival, parking & social living.
  // Bedrooms are placed exclusively on designated private sleeping floors.
  const bedroomAllocation = allocateBedroomsAcrossFloors(floorsCount, bedroomsCount);
  const bathroomAllocation = allocateBathroomsAcrossFloors(floorsCount, bathroomsCount, bedroomAllocation);

  const floors: FloorPlan[] = [];

  let placedBedrooms = 0;
  let placedBaths = 0;

  for (let lvl = 0; lvl < floorsCount; lvl++) {
    const p = `lvl${lvl}`;
    const bedsThisFloor = bedroomAllocation[lvl] || 0;
    const bathsThisFloor = bathroomAllocation[lvl] || 0;
    const rooms: Room[] = [];

    // ==========================================
    // LEVEL 0: GROUND FLOOR (Arrival, Parking, Stilt Bay & Rear OTS Garden)
    // ==========================================
    if (lvl === 0) {
      if (floorsCount === 1) {
        // Single story house: Place all living + bedrooms on Ground
        rooms.push(...generateSingleStoryGroundRooms(config, bedsThisFloor, bathsThisFloor));
        floors.push({
          level: 0,
          floorName: 'Ground Floor Plan',
          rooms,
        });
      } else {
        // Multi-story townhome: Ground floor is arrival, covered parking, foyer, driver bath, rear lawn
        const parkingDepth = frontDepth + coreDepth;

        rooms.push({
          id: `${p}-stilt-parking`,
          name: 'Covered Stilt Parking Bay (2-3 SUVs & EV Station)',
          x: originX,
          y: originY,
          width: leftWingWidth,
          length: parkingDepth,
          doors: [{ id: `${p}-d-gate`, wall: 'top', offset: 2, width: 8.0 }],
          windows: [],
        });

        rooms.push({
          id: `${p}-entry-foyer`,
          name: 'Main Grand Entrance Foyer & Express Lift Lobby',
          x: originX + leftWingWidth,
          y: originY,
          width: rightWingWidth,
          length: frontDepth,
          doors: [{ id: `${p}-d-main-in`, wall: 'top', offset: Math.round(rightWingWidth / 2), width: 3.5 }],
          windows: [{ id: `${p}-w-foyer`, wall: 'right', offset: 3, width: 3.0 }],
        });

        // Vertical Circulation Spine (Staircase & Lift Shaft)
        rooms.push({
          id: `${p}-stair-core`,
          name: 'Horizontal Staircase & Lift Core (Ground Station)',
          x: originX + leftWingWidth,
          y: originY + frontDepth,
          width: rightWingWidth,
          length: coreDepth,
          doors: [{ id: `${p}-d-stair-in`, wall: 'left', offset: 2, width: 3.0 }],
          windows: [{ id: `${p}-w-stair`, wall: 'right', offset: 2, width: 2.5 }],
        });

        // Rear Area: Driver Washroom + Utility + Rear Landscaped Lawn
        const driverBathWidth = Math.min(Math.max(Math.round(leftWingWidth * 0.45 * 2) / 2, 5), 7);
        const storeWidth = leftWingWidth - driverBathWidth;

        rooms.push({
          id: `${p}-driver-bath`,
          name: 'Driver & Security Washroom (Powder Toilet)',
          x: originX,
          y: originY + parkingDepth,
          width: driverBathWidth,
          length: usableRearDepth,
          doors: [{ id: `${p}-d-dbath`, wall: 'top', offset: 2, width: 2.5 }],
          windows: [{ id: `${p}-w-dbath`, wall: 'left', offset: 1.5, width: 2.0 }],
        });

        rooms.push({
          id: `${p}-utility-store`,
          name: 'Utility Pump & Electrical Control Room',
          x: originX + driverBathWidth,
          y: originY + parkingDepth,
          width: storeWidth,
          length: usableRearDepth,
          doors: [{ id: `${p}-d-store`, wall: 'top', offset: 2, width: 2.5 }],
          windows: [],
        });

        rooms.push({
          id: `${p}-rear-lounge-porch`,
          name: 'Rear Verandah Sit-out (Overlooking Lawn)',
          x: originX + leftWingWidth,
          y: originY + parkingDepth,
          width: rightWingWidth,
          length: usableRearDepth,
          doors: [{ id: `${p}-d-porch`, wall: 'bottom', offset: Math.round(rightWingWidth / 2), width: 3.0 }],
          windows: [{ id: `${p}-w-porch`, wall: 'right', offset: 2, width: 3.5 }],
        });

        if (gardenDepth > 0) {
          rooms.push({
            id: `${p}-garden-lawn`,
            name: `Landscaped Garden Lawn (${Math.round(buildableWidth)}' × ${Math.round(gardenDepth)}' - Open to Sky)`,
            x: originX,
            y: originY + frontDepth + coreDepth + usableRearDepth,
            width: buildableWidth,
            length: gardenDepth,
            doors: [{ id: `${p}-d-garden`, wall: 'top', offset: Math.round(buildableWidth / 2), width: 3.5 }],
            windows: [],
          });
        }

        floors.push({
          level: 0,
          floorName: `Ground Floor (Stilt Parking & ${gardenDepth > 0 ? 'Rear Garden' : 'Lobby'})`,
          rooms,
        });
      }
    }

    // ==========================================
    // LEVEL 1: FIRST FLOOR (The Grand Social & Living Core)
    // ==========================================
    else if (lvl === 1) {
      // Front Wing: Formal Drawing & Living Room + Front Balcony
      const balcDepth = 3.5;
      const livingDepth = frontDepth - balcDepth;

      rooms.push({
        id: `${p}-front-balcony`,
        name: 'Formal Living Front Balcony (Glass Railing)',
        x: originX,
        y: originY,
        width: buildableWidth,
        length: balcDepth,
        doors: [{ id: `${p}-d-balc`, wall: 'bottom', offset: Math.round(buildableWidth / 2), width: 4.0 }],
        windows: [],
      });

      rooms.push({
        id: `${p}-drawing-living`,
        name: 'Grand Formal Drawing & Living Room (Double-Height Ceiling)',
        x: originX,
        y: originY + balcDepth,
        width: buildableWidth,
        length: livingDepth,
        doors: [{ id: `${p}-d-liv-in`, wall: 'bottom', offset: Math.round(buildableWidth / 2), width: 3.5 }],
        windows: [
          { id: `${p}-w-liv1`, wall: 'top', offset: 3, width: 4.5 },
          { id: `${p}-w-liv2`, wall: 'top', offset: Math.round(buildableWidth - 6), width: 4.5 },
        ],
      });

      // Central Circulation & Core: Horizontal Staircase & Lift Lobby + Guest Powder Room
      const powderWidth = 5.0;
      const stairWidth = buildableWidth - powderWidth;

      rooms.push({
        id: `${p}-stair-lobby`,
        name: 'Horizontal Staircase & Express Lift Lobby',
        x: originX,
        y: originY + frontDepth,
        width: stairWidth,
        length: coreDepth,
        doors: [
          { id: `${p}-d-core-front`, wall: 'top', offset: 4, width: 3.5 },
          { id: `${p}-d-core-rear`, wall: 'bottom', offset: 4, width: 3.5 },
        ],
        windows: [],
      });

      rooms.push({
        id: `${p}-powder-bath`,
        name: 'Guest Powder Room & Vanity (Toilet #1)',
        x: originX + stairWidth,
        y: originY + frontDepth,
        width: powderWidth,
        length: coreDepth,
        doors: [{ id: `${p}-d-pow`, wall: 'left', offset: 2.5, width: 2.5 }],
        windows: [{ id: `${p}-w-pow`, wall: 'right', offset: 2.5, width: 2.0 }],
      });
      placedBaths++;

      // Rear Wing: Modular Kitchen & Dining Hall OR Guest Bedroom (if >= 5 beds requested)
      if (bedsThisFloor === 0) {
        // Open Island Kitchen & Dining Hub
        const diningWidth = leftWingWidth;
        const kitchenWidth = rightWingWidth;

        rooms.push({
          id: `${p}-dining-hall`,
          name: 'Formal Dining Hall (8-10 Seater with Courtyard Vista)',
          x: originX,
          y: originY + frontDepth + coreDepth,
          width: diningWidth,
          length: usableRearDepth,
          doors: [{ id: `${p}-d-din`, wall: 'top', offset: 3, width: 3.0 }],
          windows: [{ id: `${p}-w-din`, wall: 'bottom', offset: 3, width: 4.0 }],
        });

        rooms.push({
          id: `${p}-kitchen`,
          name: 'Modular Island Kitchen & Breakfast Pantry',
          x: originX + diningWidth,
          y: originY + frontDepth + coreDepth,
          width: kitchenWidth,
          length: usableRearDepth,
          doors: [{ id: `${p}-d-kit`, wall: 'left', offset: 3, width: 3.0 }],
          windows: [{ id: `${p}-w-kit`, wall: 'right', offset: 3, width: 3.5 }],
        });
      } else {
        // 1 Guest Bedroom placed here
        placedBedrooms++;
        rooms.push({
          id: `${p}-bed-guest`,
          name: `Bedroom ${placedBedrooms}: Executive Guest Bedroom Suite`,
          x: originX,
          y: originY + frontDepth + coreDepth,
          width: leftWingWidth,
          length: usableRearDepth,
          doors: [{ id: `${p}-d-gbed`, wall: 'top', offset: 3, width: 3.0 }],
          windows: [{ id: `${p}-w-gbed`, wall: 'bottom', offset: 3, width: 4.0 }],
        });

        rooms.push({
          id: `${p}-kitchen`,
          name: 'Modular Island Kitchen & Dining Nook',
          x: originX + leftWingWidth,
          y: originY + frontDepth + coreDepth,
          width: rightWingWidth,
          length: usableRearDepth,
          doors: [{ id: `${p}-d-kit`, wall: 'top', offset: 3, width: 3.0 }],
          windows: [{ id: `${p}-w-kit`, wall: 'right', offset: 3, width: 3.5 }],
        });
      }

      if (gardenDepth > 0) {
        rooms.push({
          id: `${p}-ots-garden`,
          name: "Open-to-Sky Garden Void (6' × 20' Vertical Lightwell)",
          x: originX,
          y: originY + frontDepth + coreDepth + usableRearDepth,
          width: buildableWidth,
          length: gardenDepth,
          doors: [],
          windows: [],
        });
      }

      floors.push({
        level: 1,
        floorName: 'First Floor (Grand Living, Dining & Island Kitchen)',
        rooms,
      });
    }

    // ==========================================
    // LEVEL 2: SECOND FLOOR (Family Wellness, Media & Study OR Bedroom Suite)
    // ==========================================
    else if (lvl === 2) {
      if (bedsThisFloor === 0) {
        // Zero bedrooms: Dedicated Family Entertainment, Home Cinema & Study
        const balcDepth = 3.5;

        rooms.push({
          id: `${p}-balcony-front`,
          name: 'Media Lounge Front Balcony',
          x: originX,
          y: originY,
          width: buildableWidth,
          length: balcDepth,
          doors: [{ id: `${p}-d-mbalc`, wall: 'bottom', offset: Math.round(buildableWidth / 2), width: 3.5 }],
          windows: [],
        });

        rooms.push({
          id: `${p}-media-cinema`,
          name: 'Family Dolby Atmos Cinema Lounge & TV Den',
          x: originX,
          y: originY + balcDepth,
          width: buildableWidth,
          length: frontDepth - balcDepth,
          doors: [{ id: `${p}-d-cin-in`, wall: 'bottom', offset: Math.round(buildableWidth / 2), width: 3.5 }],
          windows: [{ id: `${p}-w-cin`, wall: 'top', offset: 4, width: 4.5 }],
        });

        // Staircase Core
        rooms.push({
          id: `${p}-stair-lobby`,
          name: 'Horizontal Staircase & Lift Lobby Core',
          x: originX,
          y: originY + frontDepth,
          width: buildableWidth,
          length: coreDepth,
          doors: [
            { id: `${p}-d-cfront`, wall: 'top', offset: 4, width: 3.0 },
            { id: `${p}-d-crear`, wall: 'bottom', offset: 4, width: 3.0 },
          ],
          windows: [{ id: `${p}-w-score`, wall: 'right', offset: 2, width: 3.0 }],
        });

        // Rear Wing: Executive Study / Library & Wellness Fitness Gym
        rooms.push({
          id: `${p}-study-library`,
          name: 'Executive Study & Architectural Library',
          x: originX,
          y: originY + frontDepth + coreDepth,
          width: leftWingWidth,
          length: usableRearDepth,
          doors: [{ id: `${p}-d-study`, wall: 'top', offset: 3, width: 3.0 }],
          windows: [{ id: `${p}-w-study`, wall: 'bottom', offset: 3, width: 4.0 }],
        });

        rooms.push({
          id: `${p}-fitness-gym`,
          name: 'Wellness Fitness Gym & Yoga Studio',
          x: originX + leftWingWidth,
          y: originY + frontDepth + coreDepth,
          width: rightWingWidth,
          length: usableRearDepth,
          doors: [{ id: `${p}-d-gym`, wall: 'top', offset: 3, width: 3.0 }],
          windows: [{ id: `${p}-w-gym`, wall: 'right', offset: 3, width: 3.5 }],
        });
      } else {
        // Place 1 or 2 bedrooms on Level 2
        rooms.push(...generateBedroomFloorRooms(p, originX, originY, buildableWidth, frontDepth, coreDepth, usableRearDepth, bedsThisFloor, placedBedrooms, bathsThisFloor, placedBaths));
        placedBedrooms += bedsThisFloor;
        placedBaths += bathsThisFloor;
      }

      if (gardenDepth > 0) {
        rooms.push({
          id: `${p}-ots-garden`,
          name: "Open-to-Sky Garden Void (6' × 20' Vertical Lightwell)",
          x: originX,
          y: originY + frontDepth + coreDepth + usableRearDepth,
          width: buildableWidth,
          length: gardenDepth,
          doors: [],
          windows: [],
        });
      }

      floors.push({
        level: 2,
        floorName: bedsThisFloor > 0 ? `Second Floor Plan (${bedsThisFloor} Bedroom Suite)` : 'Second Floor (Family Media Lounge, Study & Gym)',
        rooms,
      });
    }

    // ==========================================
    // LEVEL 3: THIRD FLOOR (Private Bedroom Suite Floor)
    // ==========================================
    else if (lvl === 3) {
      const suiteRooms = generateBedroomFloorRooms(
        p,
        originX,
        originY,
        buildableWidth,
        frontDepth,
        coreDepth,
        usableRearDepth,
        bedsThisFloor,
        placedBedrooms,
        bathsThisFloor,
        placedBaths,
        'Junior Master Suite'
      );
      placedBedrooms += bedsThisFloor;
      placedBaths += bathsThisFloor;
      rooms.push(...suiteRooms);

      if (gardenDepth > 0) {
        rooms.push({
          id: `${p}-ots-garden`,
          name: "Open-to-Sky Garden Void (6' × 20' Vertical Lightwell)",
          x: originX,
          y: originY + frontDepth + coreDepth + usableRearDepth,
          width: buildableWidth,
          length: gardenDepth,
          doors: [],
          windows: [],
        });
      }

      floors.push({
        level: 3,
        floorName: `Third Floor (Bedroom ${placedBedrooms} Suite & Private Balcony)`,
        rooms,
      });
    }

    // ==========================================
    // LEVEL 4: FOURTH FLOOR (Executive Bedroom Suite Floor)
    // ==========================================
    else if (lvl === 4) {
      const suiteRooms = generateBedroomFloorRooms(
        p,
        originX,
        originY,
        buildableWidth,
        frontDepth,
        coreDepth,
        usableRearDepth,
        bedsThisFloor,
        placedBedrooms,
        bathsThisFloor,
        placedBaths,
        'Executive Bedroom Suite'
      );
      placedBedrooms += bedsThisFloor;
      placedBaths += bathsThisFloor;
      rooms.push(...suiteRooms);

      if (gardenDepth > 0) {
        rooms.push({
          id: `${p}-ots-garden`,
          name: "Open-to-Sky Garden Void (6' × 20' Vertical Lightwell)",
          x: originX,
          y: originY + frontDepth + coreDepth + usableRearDepth,
          width: buildableWidth,
          length: gardenDepth,
          doors: [],
          windows: [],
        });
      }

      floors.push({
        level: 4,
        floorName: `Fourth Floor (Bedroom ${placedBedrooms} Suite & Lounge)`,
        rooms,
      });
    }

    // ==========================================
    // LEVEL 5: FIFTH FLOOR (The Master Sanctuary & Penthouse Sky Terrace)
    // ==========================================
    else if (lvl === 5) {
      placedBedrooms++;
      placedBaths++;

      // Front Wing: Open Sky Landscaped Terrace & Covered Cocktail Bar
      const terraceWidth = Math.round(buildableWidth * 0.65 * 2) / 2;
      const barWidth = buildableWidth - terraceWidth;

      rooms.push({
        id: `${p}-sky-terrace`,
        name: 'Open Sky Landscaped Terrace (Artificial Turf & Planters)',
        x: originX,
        y: originY,
        width: terraceWidth,
        length: frontDepth,
        doors: [{ id: `${p}-d-terr`, wall: 'bottom', offset: Math.round(terraceWidth / 2), width: 3.5 }],
        windows: [],
      });

      rooms.push({
        id: `${p}-cocktail-bar`,
        name: 'Covered Cocktail Bar Counter & Pergola Sit-out',
        x: originX + terraceWidth,
        y: originY,
        width: barWidth,
        length: frontDepth,
        doors: [{ id: `${p}-d-bar`, wall: 'left', offset: 2.5, width: 2.5 }],
        windows: [{ id: `${p}-w-bar`, wall: 'right', offset: 3, width: 2.5 }],
      });

      // Central Circulation: Penthouse Foyer & Staircase Mumty
      rooms.push({
        id: `${p}-stair-mumty`,
        name: 'Penthouse Foyer & Express Lift Mumty Core',
        x: originX,
        y: originY + frontDepth,
        width: buildableWidth,
        length: coreDepth,
        doors: [
          { id: `${p}-d-pfoyer-front`, wall: 'top', offset: 4, width: 3.5 },
          { id: `${p}-d-pfoyer-rear`, wall: 'bottom', offset: 4, width: 3.5 },
        ],
        windows: [{ id: `${p}-w-pfoyer`, wall: 'right', offset: 2, width: 3.0 }],
      });

      // Rear Wing: Spacious Grand Master Penthouse Suite & Spa Bath
      const bedWidth = Math.round(buildableWidth * 0.65 * 2) / 2;
      const bathWidth = buildableWidth - bedWidth;

      rooms.push({
        id: `${p}-master-penthouse-suite`,
        name: `Bedroom ${placedBedrooms}: Grand Master Penthouse Suite (Floor-to-Ceiling Glazing)`,
        x: originX,
        y: originY + frontDepth + coreDepth,
        width: bedWidth,
        length: usableRearDepth,
        doors: [
          { id: `${p}-d-msuite`, wall: 'top', offset: 3, width: 3.5 },
          { id: `${p}-d-mbath`, wall: 'right', offset: 3, width: 2.5 },
        ],
        windows: [{ id: `${p}-w-msuite`, wall: 'bottom', offset: 3, width: 5.0 }],
      });

      rooms.push({
        id: `${p}-master-spa-bath`,
        name: `Attached Luxury Spa Bath & Dressing Room (Toilet #${placedBaths})`,
        x: originX + bedWidth,
        y: originY + frontDepth + coreDepth,
        width: bathWidth,
        length: usableRearDepth,
        doors: [{ id: `${p}-d-spabath`, wall: 'left', offset: 3, width: 2.5 }],
        windows: [{ id: `${p}-w-spabath`, wall: 'right', offset: 2, width: 2.0 }],
      });

      if (gardenDepth > 0) {
        rooms.push({
          id: `${p}-ots-garden`,
          name: "Open-to-Sky Garden Void (Reaches Roof Sky)",
          x: originX,
          y: originY + frontDepth + coreDepth + usableRearDepth,
          width: buildableWidth,
          length: gardenDepth,
          doors: [],
          windows: [],
        });
      }

      floors.push({
        level: 5,
        floorName: `Fifth Floor (Grand Master Penthouse Suite & Sky Bar Terrace)`,
        rooms,
      });
    }
  }

  // Basement floor (Level -1) if requested
  if (config.hasBasement || lowerWish.includes('basement')) {
    const basementW1 = Math.round(buildableWidth * 0.5 * 2) / 2;
    const basementW2 = buildableWidth - basementW1;
    const basementRooms: Room[] = [
      {
        id: 'b-theater',
        name: 'Home Theater & Media Lounge',
        x: originX,
        y: originY,
        width: basementW1,
        length: frontDepth + coreDepth,
        doors: [{ id: 'bd-1', wall: 'right', offset: 4, width: 3.0 }],
        windows: [],
      },
      {
        id: 'b-gym',
        name: 'Recreational Gym & Billiards Hall',
        x: originX + basementW1,
        y: originY,
        width: basementW2,
        length: frontDepth + coreDepth,
        doors: [{ id: 'bd-2', wall: 'left', offset: 4, width: 3.0 }],
        windows: [],
      },
      {
        id: 'b-store',
        name: 'Storage & Mechanical Room',
        x: originX,
        y: originY + frontDepth + coreDepth,
        width: basementW1,
        length: usableRearDepth,
        doors: [{ id: 'bd-3', wall: 'top', offset: 2, width: 2.5 }],
        windows: [],
      },
      {
        id: 'b-powder',
        name: 'Basement Powder Toilet',
        x: originX + basementW1,
        y: originY + frontDepth + coreDepth,
        width: basementW2,
        length: usableRearDepth,
        doors: [{ id: 'bd-4', wall: 'top', offset: 2, width: 2.5 }],
        windows: [],
      },
    ];
    floors.unshift({ level: -1, floorName: 'Basement Floor Plan', rooms: basementRooms });
  }

  // Generate realistic structural RCC columns and continuous beams
  const structural = generateAlignedStructuralFrame(plotWidth, plotLength, originX, originY, buildableWidth, buildableLength, floorsCount);

  // Generate continuous vertical plumbing stacks
  const plumbing: {
    inletPoints: PlumbingPoint[];
    outletPoints: PlumbingPoint[];
  } = {
    inletPoints: [
      { x: originX + 2, y: originY + frontDepth + 3, type: 'Municipal High-Pressure Water Supply (1-inch GI Line)' },
      { x: originX + buildableWidth - 2, y: originY + buildableLength - 2, type: 'Overhead Gravity Feed Dual Supply Line (From Roof Mumty)' },
    ],
    outletPoints: [
      { x: originX + 2, y: originY + buildableLength, type: 'Main Sewer 110mm PVC Soil Stack & Gully Trap' },
      { x: originX + buildableWidth - 2, y: originY + buildableLength, type: 'Rainwater Harvesting & Courtyard Drain Connection' },
    ],
  };

  return { floors, structural, plumbing };
}

/**
 * Generates room layouts for an exclusive private bedroom floor with attached bath & private balcony.
 */
function generateBedroomFloorRooms(
  prefix: string,
  originX: number,
  originY: number,
  buildableWidth: number,
  frontDepth: number,
  coreDepth: number,
  rearDepth: number,
  bedsToPlace: number,
  currentBedIndex: number,
  bathsToPlace: number,
  currentBathIndex: number,
  suiteTitle: string = 'Executive Bedroom Suite'
): Room[] {
  const rooms: Room[] = [];
  const balcDepth = 3.5;
  const bedNum = currentBedIndex + 1;
  const bathNum = currentBathIndex + 1;

  // Front Wing: Front Balcony + Spacious Bedroom Suite
  rooms.push({
    id: `${prefix}-front-balcony`,
    name: `Private Front Balcony (Sit-out)`,
    x: originX,
    y: originY,
    width: buildableWidth,
    length: balcDepth,
    doors: [{ id: `${prefix}-d-fbalc`, wall: 'bottom', offset: Math.round(buildableWidth / 2), width: 3.5 }],
    windows: [],
  });

  rooms.push({
    id: `${prefix}-bed-suite`,
    name: `Bedroom ${bedNum}: ${suiteTitle} (Walk-in Wardrobe & Lounge)`,
    x: originX,
    y: originY + balcDepth,
    width: buildableWidth,
    length: frontDepth - balcDepth,
    doors: [
      { id: `${prefix}-d-bed-in`, wall: 'bottom', offset: Math.round(buildableWidth * 0.4), width: 3.5 },
      { id: `${prefix}-d-bed-bath`, wall: 'bottom', offset: Math.round(buildableWidth * 0.8), width: 2.5 },
    ],
    windows: [
      { id: `${prefix}-w-bed1`, wall: 'top', offset: 3, width: 4.5 },
      { id: `${prefix}-w-bed2`, wall: 'top', offset: Math.round(buildableWidth - 5), width: 4.5 },
    ],
  });

  // Central Core: Horizontal Staircase & Lift Core + Attached Bathroom
  const bathWidth = Math.min(Math.max(Math.round(buildableWidth * 0.35 * 2) / 2, 5), 7);
  const stairWidth = buildableWidth - bathWidth;

  rooms.push({
    id: `${prefix}-stair-lobby`,
    name: 'Horizontal Staircase & Express Lift Lobby',
    x: originX,
    y: originY + frontDepth,
    width: stairWidth,
    length: coreDepth,
    doors: [
      { id: `${prefix}-d-core-front`, wall: 'top', offset: 3.5, width: 3.5 },
      { id: `${prefix}-d-core-rear`, wall: 'bottom', offset: 3.5, width: 3.5 },
    ],
    windows: [],
  });

  rooms.push({
    id: `${prefix}-attached-bath`,
    name: `Attached Luxury Bathroom & Dressing Vanity (Toilet #${bathNum})`,
    x: originX + stairWidth,
    y: originY + frontDepth,
    width: bathWidth,
    length: coreDepth,
    doors: [{ id: `${prefix}-d-bath-in`, wall: 'top', offset: 2, width: 2.5 }],
    windows: [{ id: `${prefix}-w-bath`, wall: 'right', offset: 2, width: 2.0 }],
  });

  // Rear Wing: Family Sitting Snug & Rear Balcony
  const halfWidth = Math.round(buildableWidth * 0.5 * 2) / 2;

  rooms.push({
    id: `${prefix}-snug-lounge`,
    name: 'Pajama Lounge & Evening Tea Nook',
    x: originX,
    y: originY + frontDepth + coreDepth,
    width: halfWidth,
    length: rearDepth,
    doors: [{ id: `${prefix}-d-snug`, wall: 'top', offset: 3, width: 3.0 }],
    windows: [{ id: `${prefix}-w-snug`, wall: 'bottom', offset: 3, width: 4.0 }],
  });

  rooms.push({
    id: `${prefix}-rear-balcony`,
    name: 'Rear Courtyard Balcony (Garden View)',
    x: originX + halfWidth,
    y: originY + frontDepth + coreDepth,
    width: buildableWidth - halfWidth,
    length: rearDepth,
    doors: [{ id: `${prefix}-d-rbalc`, wall: 'top', offset: 3, width: 3.0 }],
    windows: [{ id: `${prefix}-w-rbalc`, wall: 'right', offset: 2, width: 3.0 }],
  });

  return rooms;
}

/**
 * Single-story Ground Floor Room Generator for 1-floor bungalows.
 */
function generateSingleStoryGroundRooms(
  config: ArchitecturalPlannerConfig,
  bedsCount: number,
  bathsCount: number
): Room[] {
  const { originX, originY, buildableWidth, buildableLength } = config;
  const frontLen = Math.round(buildableLength * 0.45 * 2) / 2;
  const rearLen = buildableLength - frontLen;
  const halfW = Math.round(buildableWidth * 0.5 * 2) / 2;

  return [
    {
      id: 'g-living',
      name: 'Formal Living & Dining Room',
      x: originX,
      y: originY,
      width: halfW,
      length: frontLen,
      doors: [{ id: 'gd-main', wall: 'bottom', offset: 3, width: 3.5 }],
      windows: [{ id: 'gw-liv', wall: 'top', offset: 3, width: 4.5 }],
    },
    {
      id: 'g-kitchen',
      name: 'Modular Kitchen & Pantry',
      x: originX + halfW,
      y: originY,
      width: buildableWidth - halfW,
      length: frontLen,
      doors: [{ id: 'gd-kit', wall: 'left', offset: 2, width: 3.0 }],
      windows: [{ id: 'gw-kit', wall: 'right', offset: 3, width: 3.5 }],
    },
    {
      id: 'g-master-bed',
      name: 'Master Bedroom Suite',
      x: originX,
      y: originY + frontLen,
      width: halfW,
      length: rearLen,
      doors: [{ id: 'gd-mbed', wall: 'top', offset: 3, width: 3.0 }],
      windows: [{ id: 'gw-mbed', wall: 'bottom', offset: 3, width: 4.0 }],
    },
    {
      id: 'g-bath-core',
      name: 'Attached Bathroom & Powder Toilet',
      x: originX + halfW,
      y: originY + frontLen,
      width: buildableWidth - halfW,
      length: rearLen,
      doors: [{ id: 'gd-bath', wall: 'left', offset: 2, width: 2.5 }],
      windows: [{ id: 'gw-bath', wall: 'right', offset: 2, width: 2.5 }],
    },
  ];
}

/**
 * Distributes the exact target bedrooms across the available floors.
 * Prevents unwanted excess bedrooms while ensuring each bedroom is spacious.
 */
function allocateBedroomsAcrossFloors(floorsCount: number, totalBedrooms: number): number[] {
  const allocation = new Array(floorsCount).fill(0);

  if (floorsCount === 1) {
    allocation[0] = totalBedrooms;
    return allocation;
  }

  let remaining = totalBedrooms;

  // In multi-level townhomes (G+2 to G+5):
  // Ground (0) has 0 beds.
  // First (1) has 0 beds (Living/Kitchen) unless totalBedrooms >= 5.
  // Fifth / Penthouse (top floor) always gets 1 Master Suite.
  // Remaining bedrooms are distributed starting from top floors downward.
  const topFloor = floorsCount - 1;
  allocation[topFloor] = Math.min(remaining, 1);
  remaining -= allocation[topFloor];

  for (let fl = topFloor - 1; fl >= 2 && remaining > 0; fl--) {
    allocation[fl] = 1;
    remaining--;
  }

  // If still remaining (e.g. 5+ beds), place on Floor 1
  if (remaining > 0 && floorsCount >= 2) {
    allocation[1] = 1;
    remaining--;
  }

  // If still remaining, add secondary rooms to Floor 2 or 3
  let fl = 2;
  while (remaining > 0 && fl < floorsCount) {
    allocation[fl]++;
    remaining--;
    fl++;
  }

  return allocation;
}

/**
 * Distributes bathrooms to support the bedroom suites and social zones.
 */
function allocateBathroomsAcrossFloors(
  floorsCount: number,
  totalBathrooms: number,
  bedroomAllocation: number[]
): number[] {
  const allocation = new Array(floorsCount).fill(0);

  if (floorsCount === 1) {
    allocation[0] = totalBathrooms;
    return allocation;
  }

  // Each floor with a bedroom gets an attached bathroom
  for (let fl = 1; fl < floorsCount; fl++) {
    if (bedroomAllocation[fl] > 0) {
      allocation[fl] = bedroomAllocation[fl];
    }
  }

  // Social living floor (Level 1) gets 1 powder toilet
  if (floorsCount >= 2) {
    allocation[1] = Math.max(allocation[1], 1);
  }

  return allocation;
}

/**
 * Generates an engineering-grade aligned RCC structural frame (Columns and Beams).
 */
function generateAlignedStructuralFrame(
  plotWidth: number,
  plotLength: number,
  originX: number,
  originY: number,
  buildableWidth: number,
  buildableLength: number,
  floorsCount: number
): StructuralLayout {
  const columns: ColumnDef[] = [];
  const beams: BeamDef[] = [];

  // Determine column grid lines along width (X axis)
  // Max span in residential RCC is 14ft. For <= 20ft plot, use 3 lines: Left, Mid, Right.
  const numXBays = buildableWidth > 26 ? 3 : 2;
  const xGridLines: number[] = [];
  for (let b = 0; b <= numXBays; b++) {
    xGridLines.push(Math.round((originX + (buildableWidth / numXBays) * b) * 10) / 10);
  }

  // Determine column grid lines along depth (Y axis)
  const numYBays = Math.max(3, Math.min(5, Math.ceil(buildableLength / 12)));
  const yGridLines: number[] = [];
  for (let b = 0; b <= numYBays; b++) {
    yGridLines.push(Math.round((originY + (buildableLength / numYBays) * b) * 10) / 10);
  }

  // Generate Columns at Grid Intersections
  let colId = 1;
  const colGridMap: string[][] = [];

  for (let i = 0; i < xGridLines.length; i++) {
    colGridMap[i] = [];
    for (let j = 0; j < yGridLines.length; j++) {
      const id = `c${colId++}`;
      colGridMap[i][j] = id;

      // Heavy columns for G+5 (9"x18" on lower levels)
      const isCorner = (i === 0 || i === xGridLines.length - 1) && (j === 0 || j === yGridLines.length - 1);
      const colSize: [number, number] = floorsCount >= 4
        ? (isCorner ? [9, 15] : [12, 18])
        : (isCorner ? [9, 12] : [9, 15]);

      columns.push({
        id,
        x: xGridLines[i],
        y: yGridLines[j],
        sizeInches: colSize,
      });
    }
  }

  // Generate Continuous Longitudinal & Transverse Beams along X and Y axes
  let beamId = 1;

  // X-direction primary beams
  for (let j = 0; j < yGridLines.length; j++) {
    for (let i = 0; i < xGridLines.length - 1; i++) {
      beams.push({
        id: `bx-${beamId++}`,
        startColumnId: colGridMap[i][j],
        endColumnId: colGridMap[i + 1][j],
      });
    }
  }

  // Y-direction primary beams
  for (let i = 0; i < xGridLines.length; i++) {
    for (let j = 0; j < yGridLines.length - 1; j++) {
      beams.push({
        id: `by-${beamId++}`,
        startColumnId: colGridMap[i][j],
        endColumnId: colGridMap[i][j + 1],
      });
    }
  }

  const footingType = floorsCount >= 4
    ? 'Heavy M25 Combined RCC Boundary Footing with Trapezoidal Center Pads (6ft depth into hard strata, SBC 180 kN/m²)'
    : 'RCC Isolated Column Pad Footing with M25 Concrete (5ft depth, SBC 150 kN/m²)';

  const slabType = floorsCount >= 4
    ? 'M25 Grade 5.5-inch Two-Way RCC Slab with Fe500D TMT Rebars & 12-inch Sunken Slabs for Bathroom Wet Areas'
    : 'M25 Reinforced Concrete 5-inch Two-Way Slab with Fe500D Steel';

  return {
    columns,
    beams,
    footingType,
    slabType,
  };
}
