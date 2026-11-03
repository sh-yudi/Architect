import { describe, it, expect } from 'vitest';
import { modifySpace } from '@/lib/ai/modifySpace';
import { getManualG5Plan } from '@/lib/ai/manualG5Plan';

describe('modifySpace engine', () => {
  it('should update room name and dimensions directly', async () => {
    const plan = getManualG5Plan();
    const result = await modifySpace({
      plan,
      floorLevel: 1,
      roomId: 'f1-room1',
      directChanges: {
        name: 'Executive Master Suite',
        width: 12,
        length: 14,
      },
      syncAllFloors: false,
    });

    expect(result.success).toBe(true);
    expect(result.updatedRoom.name).toBe('Executive Master Suite');
    expect(result.updatedRoom.width).toBe(12);
    expect(result.updatedRoom.length).toBe(14);

    const f1 = result.updatedPlan.floors.find((f) => f.level === 1);
    const room = f1?.rooms.find((r) => r.id === 'f1-room1');
    expect(room?.name).toBe('Executive Master Suite');
    expect(room?.width).toBe(12);

    // Other rooms should remain untouched
    const room2 = f1?.rooms.find((r) => r.id === 'f1-room2');
    expect(room2?.name).toContain('Room 2');
  });

  it('should update staircase based on natural language prompt', async () => {
    const plan = getManualG5Plan();
    const result = await modifySpace({
      plan,
      floorLevel: 1,
      roomId: 'f1-horizontal-lobby',
      prompt: 'Make dog-legged stairs with 8ft width',
      syncAllFloors: false,
    });

    expect(result.success).toBe(true);
    expect(result.updatedRoom.name).toContain('Dog-Legged');
    expect(result.updatedRoom.width).toBeGreaterThanOrEqual(8);
  });

  it('should synchronize vertical elements across floors when syncAllFloors is true', async () => {
    const plan = getManualG5Plan();
    const result = await modifySpace({
      plan,
      floorLevel: 1,
      roomId: 'f1-horizontal-lobby',
      directChanges: {
        width: 11,
        length: 9.5,
      },
      syncAllFloors: true,
    });

    expect(result.success).toBe(true);
    expect(result.updatedRoom.width).toBe(11);

    // Floor 2 should have synced staircase
    const f2 = result.updatedPlan.floors.find((f) => f.level === 2);
    const f2Stairs = f2?.rooms.find((r) => r.id === 'f2-horizontal-lobby');
    expect(f2Stairs?.width).toBe(11);
    expect(f2Stairs?.length).toBe(9.5);
  });

  it('should recalculate BOQ when room area changes', async () => {
    const plan = getManualG5Plan();
    const oldCost = plan.budget.total;

    const result = await modifySpace({
      plan,
      floorLevel: 1,
      roomId: 'f1-room1',
      directChanges: {
        width: 15,
        length: 18,
      },
      syncAllFloors: false,
    });

    expect(result.updatedPlan.budget.total).toBeGreaterThanOrEqual(oldCost);
  });
});
