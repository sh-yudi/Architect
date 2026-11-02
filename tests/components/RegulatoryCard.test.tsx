import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { RegulatoryCard } from '@/components/dashboard/RegulatoryCard';
import { HousePlan } from '@/types/plan';

describe('RegulatoryCard Component', () => {
  const mockPlan: HousePlan = {
    plot: { width: 30, length: 50, facing: 'East', area: 1500 },
    setbacks: { front: 10, rear: 7, left: 5, right: 5 },
    floors: [
      {
        level: 0,
        floorName: 'Ground Floor',
        rooms: [],
      },
    ],
    structural: {
      columns: [],
      beams: [],
      footingType: 'Isolated RCC',
      slabType: 'RCC',
    },
    electrical: { pointsByRoom: [] },
    plumbing: { inletPoints: [], outletPoints: [] },
    budget: { currency: 'INR', total: 2000000, lineItems: [] },
    facade: { style: 'Modern', features: [], exteriorMaterial: 'Textured Paint' },
    regulatory: {
      far: 1.25,
      groundCoverage: 55,
      builtUpArea: 1875,
      violations: [],
    },
  };

  it('should render compliance package details and metrics', () => {
    const onCAD = vi.fn();
    const onAffidavit = vi.fn();
    const { getByText } = render(
      <RegulatoryCard plan={mockPlan} onDownloadCAD={onCAD} onDownloadAffidavit={onAffidavit} />
    );

    expect(getByText('Ghaziabad Authority (GDA) Approval Package')).toBeDefined();
    expect(getByText('Bylaws Compliant')).toBeDefined();
    expect(getByText(/1.25/)).toBeDefined();
    expect(getByText(/55%/)).toBeDefined();
    expect(getByText(/10 ft/)).toBeDefined();
  });

  it('should trigger onDownloadCAD when clicking CAD button', () => {
    const onCAD = vi.fn();
    const onAffidavit = vi.fn();
    const { getByText } = render(
      <RegulatoryCard plan={mockPlan} onDownloadCAD={onCAD} onDownloadAffidavit={onAffidavit} />
    );

    const cadBtn = getByText('Download UPOBPAS AutoDCR Drawing (.DXF)');
    fireEvent.click(cadBtn);
    expect(onCAD).toHaveBeenCalledTimes(1);
  });

  it('should trigger onDownloadAffidavit when clicking Affidavit button', () => {
    const onCAD = vi.fn();
    const onAffidavit = vi.fn();
    const { getByText } = render(
      <RegulatoryCard plan={mockPlan} onDownloadCAD={onCAD} onDownloadAffidavit={onAffidavit} />
    );

    const affBtn = getByText('Download GDA Notarized Affidavit (.PDF)');
    fireEvent.click(affBtn);
    expect(onAffidavit).toHaveBeenCalledTimes(1);
  });

  it('should render review badge and violations when present', () => {
    const planWithViolations: HousePlan = {
      ...mockPlan,
      regulatory: {
        ...mockPlan.regulatory,
        violations: ['Ground coverage exceeds maximum 60%'],
      },
    };
    const { getByText } = render(
      <RegulatoryCard plan={planWithViolations} onDownloadCAD={vi.fn()} onDownloadAffidavit={vi.fn()} />
    );

    expect(getByText('Review Required')).toBeDefined();
    expect(getByText('Ground coverage exceeds maximum 60%')).toBeDefined();
  });
});
