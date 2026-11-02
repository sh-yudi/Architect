import { describe, it, expect, vi } from 'vitest';
import { POST as postGeneratePlan } from '@/app/api/generate-plan/route';
import { POST as postExportCad } from '@/app/api/export-cad/route';
import { POST as postExportAffidavit } from '@/app/api/export-affidavit/route';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';
import { PDFDocument } from 'pdf-lib';

const mockFormData: WizardFormData = {
  plot: {
    width: 30,
    length: 40,
    shape: 'rectangular',
    facing: 'East',
    city: 'Ghaziabad',
    state: 'UP',
    pincode: '201001',
  },
  requirements: {
    floors: 2,
    bedrooms: 3,
    bathrooms: 2,
    hasLivingRoom: true,
    kitchenType: 'open',
    parkingSpots: 1,
    hasPoojaRoom: true,
    hasServantQuarter: false,
    hasTerrace: true,
    hasBasement: false,
  },
  preferences: {
    style: 'Modern',
    garden: 'front',
    balconies: 1,
    windowType: 'large',
  },
  budget: {
    range: '25-40L',
    qualityTier: 'standard',
  },
  regulatory: {
    ownerName: 'A. Sharma',
    fatherOrSpouseName: 'S. Sharma',
    khasraNumber: '1',
    khatauniNumber: '2',
    authorityName: 'GDA',
    zone: 'Zone 1',
  },
};

const mockPlan: HousePlan = {
  plot: { width: 30, length: 40, facing: 'East', area: 1200 },
  setbacks: { front: 10, rear: 5, left: 3, right: 3 },
  floors: [
    {
      level: 0,
      floorName: 'Ground Floor',
      rooms: [
        { id: 'r1', name: 'Living Room', x: 3, y: 10, width: 14, length: 16, doors: [], windows: [] },
      ],
    },
  ],
  structural: { columns: [], beams: [], footingType: 'isolated', slabType: 'RCC' },
  electrical: { pointsByRoom: [] },
  plumbing: { inletPoints: [], outletPoints: [] },
  budget: { currency: 'INR', total: 2500000, lineItems: [] },
  facade: { style: 'Modern', features: [], exteriorMaterial: 'Plaster' },
  regulatory: { far: 1.5, groundCoverage: 50, builtUpArea: 600, violations: [] },
};

describe('API Route: POST /api/generate-plan', () => {
  it('should generate plan and return valid project ID and plan', async () => {
    const mockRequest = new Request('http://localhost:3000/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockFormData),
    });

    const response = await postGeneratePlan(mockRequest);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.projectId).toBeDefined();
    expect(typeof body.projectId).toBe('string');
    expect(body.projectId.startsWith('proj_')).toBe(true);
    expect(body.plan).toBeDefined();
    expect(body.plan.plot.width).toBe(30);
    expect(body.plan.plot.length).toBe(40);
  });

  it('should return 500 when plan generation fails', async () => {
    // Malformed request with invalid JSON body
    const mockRequest = new Request('http://localhost:3000/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json',
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = await postGeneratePlan(mockRequest);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Failed to generate plan');
    consoleSpy.mockRestore();
  });
});

describe('API Route: POST /api/export-cad', () => {
  it('should stream back DXF CAD file with correct headers', async () => {
    const mockRequest = new Request('http://localhost:3000/api/export-cad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: mockPlan }),
    });

    const response = await postExportCad(mockRequest);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/dxf');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="upobpas-building-plan.dxf"'
    );

    const dxfText = await response.text();
    expect(dxfText).toContain('SECTION');
    expect(dxfText).toContain('ENTITIES');
    expect(dxfText).toContain('EOF');
    expect(dxfText).toContain('PLOT_BOUNDARY');
  });

  it('should return 500 on export CAD failure', async () => {
    const mockRequest = new Request('http://localhost:3000/api/export-cad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json',
    });

    const response = await postExportCad(mockRequest);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('DXF export failed');
  });
});

describe('API Route: POST /api/export-affidavit', () => {
  it('should stream back affidavit PDF bytes with correct headers', async () => {
    const mockRequest = new Request('http://localhost:3000/api/export-affidavit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: mockPlan, formData: mockFormData }),
    });

    const response = await postExportAffidavit(mockRequest);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="gda-approval-affidavit.pdf"'
    );

    const arrayBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('should return 500 on export affidavit failure', async () => {
    const mockRequest = new Request('http://localhost:3000/api/export-affidavit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json',
    });

    const response = await postExportAffidavit(mockRequest);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('PDF export failed');
  });
});
