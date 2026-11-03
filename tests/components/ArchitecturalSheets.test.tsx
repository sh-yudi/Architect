import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { StructuralGridSheet } from '@/components/sheets/StructuralGridSheet';
import { FoundationRCCSheet } from '@/components/sheets/FoundationRCCSheet';
import { DoorWindowScheduleSheet } from '@/components/sheets/DoorWindowScheduleSheet';
import { MEPServicesSheet } from '@/components/sheets/MEPServicesSheet';
import { FrontElevationSheet } from '@/components/sheets/FrontElevationSheet';
import { HousePlan } from '@/types/plan';

describe('Architectural Engineering Sheets', () => {
  const mockPlan: HousePlan = {
    plot: { width: 30, length: 50, facing: 'East', area: 1500 },
    setbacks: { front: 10, rear: 7, left: 3, right: 3 },
    floors: [
      {
        level: 0,
        floorName: 'Ground Floor & Stilt Parking',
        rooms: [
          { id: 'g1', name: 'Car Parking & Driveway', x: 3, y: 10, width: 20, length: 30, doors: [], windows: [] },
          { id: 'g2', name: 'Backyard Garden Lawn', x: 3, y: 44, width: 20, length: 6, doors: [], windows: [] },
        ],
      },
    ],
    structural: { columns: [], beams: [], footingType: 'Isolated RCC', slabType: 'RCC' },
    electrical: { pointsByRoom: [] },
    plumbing: { inletPoints: [], outletPoints: [] },
    budget: { currency: 'INR', total: 2500000, lineItems: [] },
    facade: { style: 'Modern', features: [], exteriorMaterial: 'Textured Paint' },
    regulatory: { far: 1.25, groundCoverage: 55, builtUpArea: 1875, violations: [] },
  };

  it('should render StructuralGridSheet with grid bubbles, columns and specifications', () => {
    const { getByText, getAllByText, container } = render(
      <StructuralGridSheet plan={mockPlan} plotWidth={30} plotLength={50} />
    );

    expect(getByText('SHEET S-01')).toBeDefined();
    expect(getByText('Column Centerline Grid Plan')).toBeDefined();
    expect(getByText(/SCHEDULE OF COLUMNS \(IS: 456-2000\)/)).toBeDefined();
    expect(getAllByText(/C0 \(Corner\)/).length).toBeGreaterThanOrEqual(1);
    expect(getByText(/CONCRETE GRADE:/)).toBeDefined();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('should toggle theme in StructuralGridSheet', () => {
    const { getByText } = render(
      <StructuralGridSheet plan={mockPlan} plotWidth={30} plotLength={50} />
    );

    const toggleBtn = getByText(/Blueprint Mode/);
    fireEvent.click(toggleBtn);
    expect(getByText(/Paper View/)).toBeDefined();
  });

  it('should render FoundationRCCSheet with footing cross-section and beam schedule', () => {
    const { getByText, container } = render(
      <FoundationRCCSheet plan={mockPlan} plotWidth={30} plotLength={50} />
    );

    expect(getByText(/SHEET S-03 & S-08/)).toBeDefined();
    expect(getByText('Foundation & RCC Reinforcement Schedules')).toBeDefined();
    expect(getByText(/100mm THK\. P\.C\.C\. 1:4:8 BEDDING/)).toBeDefined();
    expect(getByText(/PLINTH BEAM \(PB\) REINFORCEMENT SCHEDULE/)).toBeDefined();
    expect(getByText('7" Sunken Slab for Attached Toilets & Bathrooms:')).toBeDefined();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('should render DoorWindowScheduleSheet with opening schedules and hardware specs', () => {
    const { getByText, getAllByText } = render(<DoorWindowScheduleSheet plan={mockPlan} />);

    expect(getByText('SHEET W-07')).toBeDefined();
    expect(getByText('Schedule of Doors & Windows')).toBeDefined();
    expect(getByText('DOOR OPENING SCHEDULE (DR)')).toBeDefined();
    expect(getByText('WINDOW & VENTILATOR SCHEDULE (W & V)')).toBeDefined();
    expect(getAllByText('Main Entrance Double Door').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Toilet & Bathroom Ventilator').length).toBeGreaterThanOrEqual(1);
    expect(getByText('ARCHITECTURAL JOINERY NOTES')).toBeDefined();
  });

  it('should render MEPServicesSheet and toggle between drainage and electrical tabs', () => {
    const { getByText } = render(<MEPServicesSheet plan={mockPlan} />);

    expect(getByText(/SHEET E-01 & D-01/)).toBeDefined();
    expect(getByText(/MEP Services & Plumbing Drainage Layout/)).toBeDefined();
    expect(getByText(/WATER SUPPLY & SANITARY DRAINAGE SPECIFICATIONS/)).toBeDefined();

    // Toggle to Electrical sub-tab
    const elecBtn = getByText(/Electrical Wiring \(E-01\)/);
    fireEvent.click(elecBtn);
    expect(getByText(/ELECTRICAL LOAD ESTIMATE & CONDUIT SCHEDULE/)).toBeDefined();
    expect(getByText(/CENTRAL DB PANEL/)).toBeDefined();
  });

  it('should render FrontElevationSheet with elevation datums and material finishes', () => {
    const { getByText } = render(<FrontElevationSheet plan={mockPlan} />);

    expect(getByText('SHEET W-01')).toBeDefined();
    expect(getByText('Front Elevation Working Drawing')).toBeDefined();
    expect(getByText(/ROAD LEVEL • ±0'-0"/)).toBeDefined();
    expect(getByText(/PLINTH LEVEL • \+3'-0"/)).toBeDefined();
    expect(getByText(/EXTERIOR FINISH & MATERIAL SCHEDULE/)).toBeDefined();
    expect(getByText('Asian Paints Apex Ultima Protek (High-Performance Exterior Emulsion)')).toBeDefined();
  });
});
