import { HousePlan } from '@/types/plan';
import Drawing from 'dxf-writer';

export function generatePlanDXF(plan: HousePlan): string {
  const d = new Drawing();

  // UPOBPAS standard layer specifications
  d.addLayer('PLOT_BOUNDARY', Drawing.ACI.BLUE, 'CONTINUOUS');
  d.addLayer('BUILDING_ENVELOPE', Drawing.ACI.RED, 'CONTINUOUS');
  d.addLayer('ROOMS_WALLS', Drawing.ACI.WHITE, 'CONTINUOUS');
  d.addLayer('TEXT_ANNOTATIONS', Drawing.ACI.YELLOW, 'CONTINUOUS');

  // 1. Draw Plot Boundary
  d.setActiveLayer('PLOT_BOUNDARY');
  d.drawRect(0, 0, plan.plot.width, plan.plot.length);

  // 2. Draw Building Envelope if setbacks exist
  if (plan.setbacks) {
    d.setActiveLayer('BUILDING_ENVELOPE');
    const x1 = plan.setbacks.left;
    const y1 = plan.setbacks.front;
    const x2 = plan.plot.width - plan.setbacks.right;
    const y2 = plan.plot.length - plan.setbacks.rear;
    if (x2 > x1 && y2 > y1) {
      d.drawRect(x1, y1, x2, y2);
    }
  }

  // 3. Draw Rooms per floor
  d.setActiveLayer('ROOMS_WALLS');
  plan.floors.forEach((floor) => {
    floor.rooms.forEach((room) => {
      d.setActiveLayer('ROOMS_WALLS');
      d.drawRect(room.x, room.y, room.x + room.width, room.y + room.length);
      d.setActiveLayer('TEXT_ANNOTATIONS');
      d.drawText(
        room.x + room.width / 2 - 2,
        room.y + room.length / 2,
        0.8,
        0,
        `${room.name} (${room.width}'x${room.length}')`
      );
      d.setActiveLayer('ROOMS_WALLS');
    });
  });

  return d.toDxfString();
}
