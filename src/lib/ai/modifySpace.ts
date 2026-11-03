import { HousePlan, FloorPlan, Room } from '@/types/plan';
import { calculateDetailedBOQ } from '@/lib/rates/calculator';
import { createGeminiClient } from '@/lib/ai/geminiClient';

export interface ModifySpaceRequest {
  plan: HousePlan;
  floorLevel: number;
  roomId: string;
  prompt?: string;
  directChanges?: {
    name?: string;
    width?: number;
    length?: number;
    x?: number;
    y?: number;
  };
  syncAllFloors?: boolean;
}

export interface ModifySpaceResponse {
  success: boolean;
  updatedPlan: HousePlan;
  updatedRoom: Room;
  message: string;
}

/**
 * Modifies a single room/space within a house plan, either via direct dimensional
 * edits or via natural language AI prompt (e.g. "Make staircase dog-legged with 8ft width").
 *
 * If syncAllFloors is true, matching vertical elements (e.g. stairs, lifts, ducts)
 * are synchronized across all floors to maintain vertical structural alignment.
 */
export async function modifySpace(
  request: ModifySpaceRequest,
  apiKey?: string
): Promise<ModifySpaceResponse> {
  const { plan, floorLevel, roomId, prompt, directChanges, syncAllFloors } = request;

  // Deep clone plan to ensure immutability
  const updatedPlan: HousePlan = JSON.parse(JSON.stringify(plan));

  const targetFloor = updatedPlan.floors.find((f) => f.level === floorLevel);
  if (!targetFloor) {
    throw new Error(`Floor with level ${floorLevel} not found in plan`);
  }

  const roomIndex = targetFloor.rooms.findIndex((r) => r.id === roomId);
  if (roomIndex === -1) {
    throw new Error(`Room with ID "${roomId}" not found on floor level ${floorLevel}`);
  }

  let roomToUpdate: Room = { ...targetFloor.rooms[roomIndex] };
  let changeDescription = '';

  // 1. Apply direct changes if provided
  if (directChanges) {
    if (directChanges.name && directChanges.name.trim()) {
      roomToUpdate.name = directChanges.name.trim();
      changeDescription += `Renamed to "${roomToUpdate.name}". `;
    }
    if (typeof directChanges.width === 'number' && directChanges.width > 0) {
      roomToUpdate.width = Math.round(directChanges.width * 10) / 10;
      changeDescription += `Width set to ${roomToUpdate.width}ft. `;
    }
    if (typeof directChanges.length === 'number' && directChanges.length > 0) {
      roomToUpdate.length = Math.round(directChanges.length * 10) / 10;
      changeDescription += `Length set to ${roomToUpdate.length}ft. `;
    }
    if (typeof directChanges.x === 'number') {
      roomToUpdate.x = Math.max(0, directChanges.x);
    }
    if (typeof directChanges.y === 'number') {
      roomToUpdate.y = Math.max(0, directChanges.y);
    }
  }

  // 2. If an AI prompt is provided, process with Gemini or deterministic rule engine
  if (prompt && prompt.trim()) {
    const trimmedPrompt = prompt.trim();
    const lowerPrompt = trimmedPrompt.toLowerCase();
    let aiSuccess = false;

    // Try Gemini API first if configured
    const gemini = createGeminiClient(apiKey);
    if (gemini) {
      try {
        const { Type } = await import('@google/genai');
        const systemPrompt = `You are a licensed chief structural architect.
The client wants to modify a specific room/space inside a residential floor plan.
Current Room Details:
- Name: "${roomToUpdate.name}"
- Dimensions: ${roomToUpdate.width}ft width x ${roomToUpdate.length}ft length
- Position: (${roomToUpdate.x}, ${roomToUpdate.y})
- Plot Size: ${plan.plot.width}ft x ${plan.plot.length}ft
Client Request for this room:
"${trimmedPrompt}"

Instructions:
1. Update ONLY this space's parameters (name, width, length, doors, windows).
2. Ensure realistic architectural dimensions:
   - Staircases: minimum 6ft to 10ft width, 8ft to 12ft length.
   - Bathrooms: 4ft to 7ft width, 6ft to 9ft length.
   - Bedrooms: minimum 9ft to 14ft width, 10ft to 16ft length.
   - Balconies: 3ft to 5ft length.
3. Return the updated room JSON adhering strictly to the schema.`;

        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                width: { type: Type.NUMBER },
                length: { type: Type.NUMBER },
                actionSummary: { type: Type.STRING },
              },
              required: ['name', 'width', 'length', 'actionSummary'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.name) roomToUpdate.name = parsed.name;
          if (typeof parsed.width === 'number' && parsed.width >= 3) {
            roomToUpdate.width = Math.min(Math.max(parsed.width, 3), plan.plot.width);
          }
          if (typeof parsed.length === 'number' && parsed.length >= 3) {
            roomToUpdate.length = Math.min(Math.max(parsed.length, 3), plan.plot.length);
          }
          changeDescription += parsed.actionSummary || `Updated according to: "${trimmedPrompt}". `;
          aiSuccess = true;
        }
      } catch (err) {
        console.warn('Gemini live call for room modification failed, using rule engine:', err);
      }
    }

    // Deterministic architectural parser fallback if Gemini was unavailable or skipped
    if (!aiSuccess) {
      changeDescription += applyDeterministicPromptRules(roomToUpdate, lowerPrompt, plan.plot.width);
    }
  }

  // Constrain room boundaries within plot
  roomToUpdate.width = Math.min(Math.max(roomToUpdate.width, 3), plan.plot.width);
  roomToUpdate.length = Math.min(Math.max(roomToUpdate.length, 3), plan.plot.length);
  if (roomToUpdate.x + roomToUpdate.width > plan.plot.width) {
    roomToUpdate.x = Math.max(0, plan.plot.width - roomToUpdate.width);
  }
  if (roomToUpdate.y + roomToUpdate.length > plan.plot.length) {
    roomToUpdate.y = Math.max(0, plan.plot.length - roomToUpdate.length);
  }

  // Update room in target floor
  targetFloor.rooms[roomIndex] = roomToUpdate;

  // 3. Vertical element synchronization across all floors (e.g. Staircase, Lift, Duct)
  const isVerticalCore =
    roomToUpdate.name.toLowerCase().includes('stair') ||
    roomToUpdate.name.toLowerCase().includes('lift') ||
    roomToUpdate.id.includes('stair') ||
    roomToUpdate.id.includes('lift') ||
    roomToUpdate.name.toLowerCase().includes('ots') ||
    roomToUpdate.name.toLowerCase().includes('shaft');

  if (syncAllFloors && isVerticalCore) {
    let syncedCount = 0;
    const lowerKey = roomToUpdate.name.toLowerCase().includes('stair') ? 'stair' : 'lift';

    updatedPlan.floors.forEach((fl) => {
      if (fl.level === floorLevel) return; // already updated

      fl.rooms.forEach((otherRoom, oIdx) => {
        const matches =
          otherRoom.name.toLowerCase().includes(lowerKey) ||
          otherRoom.id.toLowerCase().includes(lowerKey);

        if (matches) {
          fl.rooms[oIdx] = {
            ...otherRoom,
            width: roomToUpdate.width,
            length: roomToUpdate.length,
            x: roomToUpdate.x,
            y: roomToUpdate.y,
          };
          syncedCount++;
        }
      });
    });

    if (syncedCount > 0) {
      changeDescription += ` Synchronized across ${syncedCount} floor levels for vertical alignment.`;
    }
  }

  // 4. Recalculate built-up area and BOQ
  const totalFloorArea = updatedPlan.floors.reduce((fSum, fl) => {
    return fSum + fl.rooms.reduce((rSum, r) => rSum + r.width * r.length, 0);
  }, 0);

  const city = plan.plot.facing ? 'Delhi' : 'Ghaziabad';
  updatedPlan.budget = calculateDetailedBOQ(Math.round(totalFloorArea), city, 'luxury');

  // Update electrical points for the modified room
  const existingElec = updatedPlan.electrical?.pointsByRoom?.find((p) => p.roomId === roomToUpdate.id);
  if (existingElec) {
    existingElec.lightPoints = Math.max(Math.floor((roomToUpdate.width * roomToUpdate.length) / 40), 2);
    existingElec.powerSockets = Math.max(Math.floor((roomToUpdate.width * roomToUpdate.length) / 45), 2);
  }

  return {
    success: true,
    updatedPlan,
    updatedRoom: roomToUpdate,
    message: changeDescription.trim() || `Successfully updated ${roomToUpdate.name}.`,
  };
}

/**
 * Deterministic prompt rule parser for common architectural edits.
 */
function applyDeterministicPromptRules(room: Room, lower: string, maxPlotWidth: number): string {
  let notes: string[] = [];

  // Width changes: e.g. "8ft width", "8' width", "width 8", "expand width to 10"
  const widthMatch = lower.match(/(?:width|wide)\s*(?:to|of|by|=)?\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|'|m)?/);
  if (widthMatch) {
    const val = parseFloat(widthMatch[1]);
    if (!isNaN(val) && val >= 3 && val <= maxPlotWidth) {
      room.width = val;
      notes.push(`Width adjusted to ${val}ft`);
    }
  } else if (lower.includes('expand width') || lower.includes('+2 width') || lower.includes('wider')) {
    room.width = Math.min(room.width + 2, maxPlotWidth);
    notes.push(`Width expanded to ${room.width}ft`);
  } else if (lower.includes('reduce width') || lower.includes('narrower')) {
    room.width = Math.max(room.width - 2, 3);
    notes.push(`Width reduced to ${room.width}ft`);
  }

  // Length changes: e.g. "12ft length", "length 10", "expand length"
  const lengthMatch = lower.match(/(?:length|long|depth)\s*(?:to|of|by|=)?\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|'|m)?/);
  if (lengthMatch) {
    const val = parseFloat(lengthMatch[1]);
    if (!isNaN(val) && val >= 3) {
      room.length = val;
      notes.push(`Length adjusted to ${val}ft`);
    }
  } else if (lower.includes('expand length') || lower.includes('+2 length') || lower.includes('longer')) {
    room.length += 2;
    notes.push(`Length expanded to ${room.length}ft`);
  } else if (lower.includes('reduce length') || lower.includes('shorter')) {
    room.length = Math.max(room.length - 2, 3);
    notes.push(`Length reduced to ${room.length}ft`);
  }

  // Staircase-specific requests
  if (lower.includes('dog-legged') || lower.includes('dog legged') || lower.includes('dogleg')) {
    room.name = 'Dog-Legged RCC Staircase with Mid-Landing (8ft Core)';
    room.width = Math.max(room.width, 8.0);
    room.length = Math.max(room.length, 9.0);
    notes.push('Reconfigured as Dog-Legged Staircase with landing');
  } else if (lower.includes('spiral')) {
    room.name = 'Contemporary Cast-Iron Spiral Staircase';
    room.width = Math.max(room.width, 6.0);
    room.length = Math.max(room.length, 6.0);
    notes.push('Reconfigured as Spiral Staircase');
  } else if (lower.includes('cantilever') || lower.includes('floating')) {
    room.name = 'Architectural Cantilever Floating Timber Staircase';
    notes.push('Upgraded to Floating Cantilever Staircase');
  }

  // Pooja / Mandir room conversion
  if (lower.includes('pooja') || lower.includes('mandir') || lower.includes('temple')) {
    room.name = 'Pooja Room (Vastu Compliant with Marble Altar)';
    room.width = Math.max(room.width, 5.0);
    room.length = Math.max(room.length, 5.0);
    notes.push('Converted to Vastu-compliant Pooja Room');
  }

  // Bathroom / Powder Room conversion
  if (lower.includes('bath') || lower.includes('washroom') || lower.includes('toilet') || lower.includes('powder')) {
    if (lower.includes('powder')) {
      room.name = 'Guest Powder Room';
      room.width = Math.min(room.width, 6.0);
      room.length = Math.min(room.length, 5.0);
    } else {
      room.name = 'Luxury Attached Bathroom (Glass Partition & Vanity)';
      room.width = Math.max(room.width, 5.0);
      room.length = Math.max(room.length, 6.5);
    }
    notes.push('Updated bathroom specifications');
  }

  // Balcony / Terrace
  if (lower.includes('balcony') || lower.includes('terrace')) {
    room.name = 'Sit-Out Balcony (Toughened Glass Railing)';
    room.length = Math.min(Math.max(room.length, 3.0), 5.0);
    notes.push('Configured as Balcony with glass railing');
  }

  // Bedroom / Suite conversion
  if (lower.includes('master suite') || lower.includes('master bed')) {
    room.name = 'Grand Master Suite with Walk-in Wardrobe Nook';
    room.width = Math.max(room.width, 10.0);
    room.length = Math.max(room.length, 12.0);
    notes.push('Upgraded to Grand Master Suite');
  }

  // Home office / Study
  if (lower.includes('study') || lower.includes('office') || lower.includes('workstation')) {
    room.name = 'Executive Study & Home Office';
    notes.push('Converted to Executive Study');
  }

  return notes.length > 0 ? notes.join(', ') + '.' : `Updated ${room.name} specifications.`;
}
