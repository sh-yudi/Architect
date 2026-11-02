import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { FloorPlanSVG } from '@/components/floorplan/FloorPlanSVG';
import { FloorPlan } from '@/types/plan';

describe('FloorPlanSVG Component', () => {
  const mockFloor: FloorPlan = {
    level: 0,
    floorName: 'Ground Floor',
    rooms: [
      { id: 'r1', name: 'Master Bedroom', x: 5, y: 10, width: 12, length: 14, doors: [], windows: [] },
      { id: 'r2', name: 'Kitchen', x: 17, y: 10, width: 10, length: 12, doors: [], windows: [] },
    ],
  };

  it('should render SVG element with room labels and dimensions', () => {
    const { getByText, container } = render(
      <FloorPlanSVG floor={mockFloor} plotWidth={30} plotLength={40} />
    );

    expect(container.querySelector('svg')).toBeDefined();
    expect(getByText('Master Bedroom')).toBeDefined();
    expect(getByText('Kitchen')).toBeDefined();
    expect(getByText("12' × 14'")).toBeDefined();
  });

  it('should render floor name and plot dimensions summary', () => {
    const { getByText } = render(
      <FloorPlanSVG floor={mockFloor} plotWidth={30} plotLength={40} />
    );

    expect(getByText('Ground Floor')).toBeDefined();
    expect(getByText(/Plot: 30' × 40' \(1200 sq ft\)/)).toBeDefined();
  });

  it('should calculate SVG width and height correctly based on plot dimensions', () => {
    const { container } = render(
      <FloorPlanSVG floor={mockFloor} plotWidth={30} plotLength={40} />
    );

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    // scale = 14, padding = 40. svgWidth = 30 * 14 + 80 = 500, svgHeight = 40 * 14 + 80 = 640
    expect(svg?.getAttribute('width')).toBe('500');
    expect(svg?.getAttribute('height')).toBe('640');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 500 640');
  });

  it('should render all rooms from the floor plan', () => {
    const { getByText } = render(
      <FloorPlanSVG floor={mockFloor} plotWidth={30} plotLength={40} />
    );

    expect(getByText('Master Bedroom')).toBeDefined();
    expect(getByText("12' × 14'")).toBeDefined();
    expect(getByText('Kitchen')).toBeDefined();
    expect(getByText("10' × 12'")).toBeDefined();
  });
});
