import { describe, it, expect, beforeAll } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThreeDViewer } from '@/components/viewer3d/ThreeDViewer';
import { BuildingMesh } from '@/components/viewer3d/BuildingMesh';
import { BuildingCanvas } from '@/components/viewer3d/BuildingCanvas';
import { HousePlan } from '@/types/plan';

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe('ThreeDViewer Component', () => {
  const mockPlan: HousePlan = {
    plot: { width: 30, length: 40, facing: 'East', area: 1200 },
    setbacks: { front: 10, rear: 5, left: 3, right: 3 },
    floors: [
      {
        level: 0,
        floorName: 'Ground',
        rooms: [{ id: 'r1', name: 'Living', x: 3, y: 10, width: 20, length: 20, doors: [], windows: [] }],
      },
    ],
    structural: { columns: [], beams: [], footingType: 'isolated', slabType: 'RCC' },
    electrical: { pointsByRoom: [] },
    plumbing: { inletPoints: [], outletPoints: [] },
    budget: { currency: 'INR', total: 2000000, lineItems: [] },
    facade: { style: 'Modern', features: ['Glass Railing'], exteriorMaterial: 'Textured Plaster' },
    regulatory: { far: 1.5, groundCoverage: 50, builtUpArea: 600, violations: [] },
  };

  it('should render 3D viewer container and header info', () => {
    const { getByText } = render(<ThreeDViewer plan={mockPlan} />);
    expect(getByText('3D Structure & Façade')).toBeDefined();
    expect(getByText(/Modern Style/)).toBeDefined();
  });

  it('should toggle between wireframe and solid mode on button click', () => {
    const { getByText } = render(<ThreeDViewer plan={mockPlan} />);
    const toggleBtn = getByText('Structural Wireframe');
    expect(toggleBtn).toBeDefined();

    fireEvent.click(toggleBtn);
    expect(getByText('Solid Mode')).toBeDefined();

    fireEvent.click(getByText('Solid Mode'));
    expect(getByText('Structural Wireframe')).toBeDefined();
  });

  it('should display plot dimensions, footing type and facade features', () => {
    const { getByText } = render(<ThreeDViewer plan={mockPlan} />);
    expect(getByText(/30' × 40' Footprint/)).toBeDefined();
    expect(getByText('isolated')).toBeDefined();
    expect(getByText(/Glass Railing/)).toBeDefined();
  });

  it('should export BuildingMesh component and return valid JSX structure', () => {
    expect(BuildingMesh).toBeDefined();
    expect(typeof BuildingMesh).toBe('function');

    const element = BuildingMesh({ plan: mockPlan, wireframe: true });
    expect(element).toBeDefined();
    expect(React.isValidElement(element)).toBe(true);
    if (React.isValidElement(element)) {
      expect(element.type).toBe('group');
      expect((element.props as { position?: number[] }).position).toEqual([-7.5, 0, -10]);
    }
  });

  it('should export BuildingCanvas component and return valid element', () => {
    expect(BuildingCanvas).toBeDefined();
    expect(typeof BuildingCanvas).toBe('function');
    const element = BuildingCanvas({ plan: mockPlan, wireframe: false });
    expect(element).toBeDefined();
    expect(React.isValidElement(element)).toBe(true);
  });
});
