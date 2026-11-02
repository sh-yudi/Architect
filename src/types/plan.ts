export type FacingDirection = 'East' | 'West' | 'North' | 'South' | 'North-East' | 'North-West' | 'South-East' | 'South-West';

export interface Point2D {
  x: number;
  y: number;
}

export interface Door {
  id: string;
  wall: 'top' | 'bottom' | 'left' | 'right';
  offset: number;
  width: number;
}

export interface Window {
  id: string;
  wall: 'top' | 'bottom' | 'left' | 'right';
  offset: number;
  width: number;
}

export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  length: number;
  doors: Door[];
  windows: Window[];
}

export interface FloorPlan {
  level: number;
  floorName: string;
  rooms: Room[];
}

export interface ColumnDef {
  id: string;
  x: number;
  y: number;
  sizeInches: [number, number];
}

export interface BeamDef {
  id: string;
  startColumnId: string;
  endColumnId: string;
}

export interface StructuralLayout {
  columns: ColumnDef[];
  beams: BeamDef[];
  footingType: string;
  slabType: string;
}

export interface RoomElectrical {
  roomId: string;
  lightPoints: number;
  fanPoints: number;
  powerSockets: number;
}

export interface PlumbingPoint {
  x: number;
  y: number;
  type: string;
}

export interface BudgetItem {
  category: 'civil' | 'finishing' | 'services' | 'regulatory';
  name: string;
  amount: number;
}

export interface BudgetSummary {
  currency: 'INR';
  total: number;
  lineItems: BudgetItem[];
}

export interface FacadeDetails {
  style: string;
  features: string[];
  exteriorMaterial: string;
}

export interface RegulatorySummary {
  far: number;
  groundCoverage: number;
  builtUpArea: number;
  violations: string[];
}

export interface HousePlan {
  plot: {
    width: number;
    length: number;
    facing: FacingDirection;
    area: number;
  };
  setbacks: {
    front: number;
    rear: number;
    left: number;
    right: number;
  };
  floors: FloorPlan[];
  structural: StructuralLayout;
  electrical: {
    pointsByRoom: RoomElectrical[];
  };
  plumbing: {
    inletPoints: PlumbingPoint[];
    outletPoints: PlumbingPoint[];
  };
  budget: BudgetSummary;
  facade: FacadeDetails;
  regulatory: RegulatorySummary;
}
