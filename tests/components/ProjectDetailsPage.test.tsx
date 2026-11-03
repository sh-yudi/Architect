import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ProjectDetailsPage from '@/app/projects/[id]/page';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';

let mockParams: { id?: string | string[] } = { id: 'test-123' };
vi.mock('next/navigation', () => ({
  useParams: () => mockParams,
}));

describe('ProjectDetailsPage Component', () => {
  const mockPlan: HousePlan = {
    plot: { width: 30, length: 50, facing: 'East', area: 1500 },
    setbacks: { front: 10, rear: 7, left: 5, right: 5 },
    floors: [
      {
        level: 0,
        floorName: 'Ground Floor',
        rooms: [
          { id: 'r1', name: 'Master Bedroom', x: 5, y: 10, width: 12, length: 14, doors: [], windows: [] },
        ],
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
    budget: {
      currency: 'INR',
      total: 2500000,
      lineItems: [
        { category: 'civil', name: 'Structure Work', amount: 1500000 },
      ],
    },
    facade: { style: 'Modern', features: [], exteriorMaterial: 'Textured Paint' },
    regulatory: {
      far: 1.25,
      groundCoverage: 55,
      builtUpArea: 1875,
      violations: [],
    },
  };

  const mockFormData: WizardFormData = {
    plot: {
      width: 30,
      length: 50,
      shape: 'rectangular',
      facing: 'East',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201001',
    },
    requirements: {
      floors: 1,
      bedrooms: 2,
      bathrooms: 2,
      hasLivingRoom: true,
      kitchenType: 'modular',
      parkingSpots: 1,
      hasPoojaRoom: false,
      hasServantQuarter: false,
      hasTerrace: true,
      hasBasement: false,
    },
    preferences: {
      style: 'Modern',
      garden: 'front',
      balconies: 1,
      windowType: 'standard',
    },
    budget: {
      range: '25-40L',
      qualityTier: 'standard',
    },
    regulatory: {
      ownerName: 'Test Owner',
      fatherOrSpouseName: 'Test Father',
      khasraNumber: '100',
      khatauniNumber: '200',
      authorityName: 'GDA',
      zone: 'Zone 1',
    },
  };

  beforeEach(() => {
    mockParams = { id: 'test-123' };
    sessionStorage.clear();
    vi.restoreAllMocks();

    // Mock window.URL methods
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should render loading state while route params are resolving', () => {
    mockParams = { id: '' };
    const { getByText } = render(<ProjectDetailsPage />);
    expect(getByText(/Loading Architectural Blueprint/)).toBeDefined();
  });

  it('should render empty state with link to /start when plan is not found in sessionStorage', () => {
    mockParams = { id: 'test-123' };
    const { getByText, getByRole } = render(<ProjectDetailsPage />);
    expect(getByText('Blueprint Not Found')).toBeDefined();
    expect(
      getByText(/No active plan found for this session\. Please create a new house plan\./)
    ).toBeDefined();
    const link = getByRole('link', { name: /Create New House Plan/i });
    expect(link.getAttribute('href')).toBe('/start');
  });

  it('should render project header and 2D floor plans when plan is loaded', () => {
    sessionStorage.setItem('plan_test-123', JSON.stringify(mockPlan));
    sessionStorage.setItem('form_test-123', JSON.stringify(mockFormData));

    const { getByText, getAllByText } = render(<ProjectDetailsPage />);

    expect(getByText('Project #test-123')).toBeDefined();
    expect(getByText('Architectural House Plan Package')).toBeDefined();
    expect(getAllByText(/30' × 50' \(1500 sq ft\)/).length).toBeGreaterThanOrEqual(1);
    expect(getByText('Ground Floor')).toBeDefined();
    expect(getByText('Master Bedroom')).toBeDefined();
  });

  it('should render "+ Create Another Plan" and "Exit" buttons linking to /start and /', () => {
    sessionStorage.setItem('plan_test-123', JSON.stringify(mockPlan));

    const { getAllByText } = render(<ProjectDetailsPage />);

    const anotherPlanLinks = getAllByText('+ Create Another Plan');
    expect(anotherPlanLinks.length).toBeGreaterThanOrEqual(1);
    expect(anotherPlanLinks[0].closest('a')?.getAttribute('href')).toBe('/start');

    const exitLinks = getAllByText('Exit');
    expect(exitLinks.length).toBeGreaterThanOrEqual(1);
    expect(exitLinks[0].closest('a')?.getAttribute('href')).toBe('/');
  });

  it('should switch between tabs: 3D Structure, Cost & BOQ, and Municipal Sanction', () => {
    sessionStorage.setItem('plan_test-123', JSON.stringify(mockPlan));

    const { getByText, queryByText } = render(<ProjectDetailsPage />);

    // Switch to 3D tab
    fireEvent.click(getByText('3D Structure'));
    expect(getByText('3D Structure & Façade')).toBeDefined();

    // Switch to Cost & BOQ tab
    fireEvent.click(getByText('Cost & BOQ'));
    expect(getByText('Itemized Bill of Quantities (BOQ)')).toBeDefined();
    expect(getByText('Structure Work')).toBeDefined();
    expect(getByText(/25,00,000/)).toBeDefined();

    // Switch to Municipal Sanction tab
    fireEvent.click(getByText('Municipal Sanction (GDA)'));
    expect(getByText('Ghaziabad Authority (GDA) Approval Package')).toBeDefined();
    expect(getByText('Bylaws Compliant')).toBeDefined();

    // Switch back to 2D Floor Plans
    fireEvent.click(getByText('2D Floor Plans'));
    expect(getByText('Ground Floor')).toBeDefined();
  });

  it('should trigger CAD export on header button click', async () => {
    sessionStorage.setItem('plan_test-123', JSON.stringify(mockPlan));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['test-dxf'], { type: 'application/dxf' })),
    });
    globalThis.fetch = fetchMock;

    const { getByText } = render(<ProjectDetailsPage />);
    const exportCadBtn = getByText('Export CAD (.DXF)');
    fireEvent.click(exportCadBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/export-cad', expect.objectContaining({
        method: 'POST',
      }));
    });
  });

  it('should trigger Affidavit export on municipal tab button click', async () => {
    sessionStorage.setItem('plan_test-123', JSON.stringify(mockPlan));
    sessionStorage.setItem('form_test-123', JSON.stringify(mockFormData));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['test-pdf'], { type: 'application/pdf' })),
    });
    globalThis.fetch = fetchMock;

    const { getByText } = render(<ProjectDetailsPage />);
    fireEvent.click(getByText('Municipal Sanction (GDA)'));

    const exportAffBtn = getByText('Download GDA Notarized Affidavit (.PDF)');
    fireEvent.click(exportAffBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/export-affidavit', expect.objectContaining({
        method: 'POST',
      }));
    });
  });
});
