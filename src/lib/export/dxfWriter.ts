import { HousePlan } from '@/types/plan';
import Drawing from 'dxf-writer';

export function generatePlanDXF(plan: HousePlan): string {
  const d = new Drawing();

  // UPOBPAS standard layer specifications
  d.addLayer('PLOT_BOUNDARY', Drawing.ACI.BLUE, 'CONTINUOUS');
  d.addLayer('BUILDING_ENVELOPE', Drawing.ACI.RED, 'CONTINUOUS');
  d.addLayer('ROOMS_WALLS', Drawing.ACI.WHITE, 'CONTINUOUS');
  d.addLayer('TEXT_ANNOTATIONS', Drawing.ACI.YELLOW, 'CONTINUOUS');

  // Draw Floors side-by-side with horizontal offset
  const floors = plan.floors.length > 0 ? plan.floors : [{ level: 0, floorName: 'Ground Floor Plan', rooms: [] }];

  floors.forEach((floor, fIdx) => {
    const offsetX = fIdx * (plan.plot.width + 15);

    // 1. Draw Plot Boundary
    d.setActiveLayer('PLOT_BOUNDARY');
    d.drawRect(offsetX, 0, offsetX + plan.plot.width, plan.plot.length);

    // 2. Draw Building Envelope if setbacks exist
    if (plan.setbacks) {
      d.setActiveLayer('BUILDING_ENVELOPE');
      const x1 = offsetX + plan.setbacks.left;
      const y1 = plan.setbacks.front;
      const x2 = offsetX + plan.plot.width - plan.setbacks.right;
      const y2 = plan.plot.length - plan.setbacks.rear;
      if (x2 > x1 && y2 > y1) {
        d.drawRect(x1, y1, x2, y2);
      }
    }

    // 3. Draw Floor Title Label above floor drawing
    d.setActiveLayer('TEXT_ANNOTATIONS');
    const floorTitle = floor.floorName
      ? (floor.floorName.toLowerCase().includes('plan') ? floor.floorName : `${floor.floorName} Plan`)
      : `Floor ${floor.level + 1} Plan`;
    d.drawText(offsetX, plan.plot.length + 2, 1.2, 0, floorTitle);

    // 4. Draw Rooms and Annotations
    floor.rooms.forEach((room) => {
      d.setActiveLayer('ROOMS_WALLS');
      d.drawRect(
        offsetX + room.x,
        room.y,
        offsetX + room.x + room.width,
        room.y + room.length
      );

      d.setActiveLayer('TEXT_ANNOTATIONS');
      d.drawText(
        offsetX + room.x + room.width / 2 - 2,
        room.y + room.length / 2,
        0.8,
        0,
        `${room.name} (${room.width}'x${room.length}')`
      );
    });
  });

  return d.toDxfString();
}
