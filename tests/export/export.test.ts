import { describe, it, expect } from 'vitest';
import { generatePlanDXF } from '@/lib/export/dxfWriter';
import { generateIndemnityAffidavitPDF } from '@/lib/export/affidavitPdf';
import { generateArchitecturalBlueprintPDF } from '@/lib/export/blueprintPdf';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';
import { PDFDocument } from 'pdf-lib';

describe('CAD & Regulatory Export Engine', () => {
  const mockPlan: HousePlan = {
    plot: { width: 30, length: 40, facing: 'East', area: 1200 },
    setbacks: { front: 10, rear: 5, left: 3, right: 3 },
    floors: [
      {
        level: 0,
        floorName: 'Ground Floor',
        rooms: [{ id: 'r1', name: 'Hall', x: 3, y: 10, width: 15, length: 20, doors: [], windows: [] }],
      },
    ],
    structural: { columns: [], beams: [], footingType: 'isolated', slabType: 'RCC' },
    electrical: { pointsByRoom: [] },
    plumbing: { inletPoints: [], outletPoints: [] },
    budget: { currency: 'INR', total: 2000000, lineItems: [] },
    facade: { style: 'Modern', features: [], exteriorMaterial: 'Plaster' },
    regulatory: { far: 1.5, groundCoverage: 50, builtUpArea: 600, violations: [] },
  };

  const mockFormData: WizardFormData = {
    plot: { width: 30, length: 40, shape: 'rectangular', facing: 'East', city: 'Ghaziabad', state: 'UP', pincode: '201001' },
    requirements: { floors: 1, bedrooms: 2, bathrooms: 2, hasLivingRoom: true, kitchenType: 'open', parkingSpots: 1, hasPoojaRoom: false, hasServantQuarter: false, hasTerrace: false, hasBasement: false },
    preferences: { style: 'Modern', garden: 'none', balconies: 0, windowType: 'standard' },
    budget: { range: '15-25L', qualityTier: 'standard' },
    regulatory: {
      ownerName: 'Vikas Gupta',
      fatherOrSpouseName: 'Suresh Gupta',
      khasraNumber: '102',
      khatauniNumber: '44',
      authorityName: 'GDA',
      zone: 'Zone 1',
    },
  };

  it('should generate valid DXF CAD text format containing layers and entities', () => {
    const dxfString = generatePlanDXF(mockPlan);
    expect(typeof dxfString).toBe('string');
    expect(dxfString).toContain('SECTION');
    expect(dxfString).toContain('ENTITIES');
    expect(dxfString).toContain('EOF');
    expect(dxfString).toContain('PLOT_BOUNDARY');
    expect(dxfString).toContain('ROOMS_WALLS');
    expect(dxfString).toContain('TEXT_ANNOTATIONS');
    expect(dxfString).toContain('Hall');
  });

  it('should generate prefilled affidavit PDF bytes with owner details', async () => {
    const pdfBytes = await generateIndemnityAffidavitPDF(mockPlan, mockFormData);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(500);

    // Verify it is a valid PDF document that can be loaded
    const loadedDoc = await PDFDocument.load(pdfBytes);
    expect(loadedDoc.getPageCount()).toBeGreaterThanOrEqual(1);
    const firstPage = loadedDoc.getPage(0);
    expect(firstPage.getWidth()).toBeCloseTo(595.28, 1);
    expect(firstPage.getHeight()).toBeCloseTo(841.89, 1);
  });

  it('should handle multi-floor plans and draw building envelope in DXF', () => {
    const multiFloorPlan: HousePlan = {
      ...mockPlan,
      floors: [
        {
          level: 0,
          floorName: 'Ground Floor',
          rooms: [
            { id: 'r1', name: 'Living Room', x: 3, y: 10, width: 14, length: 16, doors: [], windows: [] },
            { id: 'r2', name: 'Kitchen', x: 17, y: 10, width: 10, length: 12, doors: [], windows: [] },
          ],
        },
        {
          level: 1,
          floorName: 'First Floor',
          rooms: [
            { id: 'r3', name: 'Master Bedroom', x: 3, y: 10, width: 14, length: 16, doors: [], windows: [] },
          ],
        },
      ],
    };

    const dxf = generatePlanDXF(multiFloorPlan);
    expect(dxf).toContain('BUILDING_ENVELOPE');
    expect(dxf).toContain('Living Room');
    expect(dxf).toContain('Kitchen');
    expect(dxf).toContain('Master Bedroom');

    // Multi-floor spatial offset assertions: side-by-side without spatial overlap
    expect(dxf).toContain('Ground Floor Plan');
    expect(dxf).toContain('First Floor Plan');

    // Plot width is 30, so First Floor offsetX = 1 * (30 + 15) = 45.
    // Ground floor room boundary spans X in [3, 27].
    // First floor room boundary spans X in [45 + 3, 45 + 17] = [48, 62], ensuring no overlap.
    expect(dxf).toContain('\n48\n'); // x1 of First Floor Master Bedroom
    expect(dxf).toContain('\n62\n'); // x2 of First Floor Master Bedroom
    expect(dxf).toContain('\n45\n'); // offsetX boundary of First Floor plot
    expect(dxf).toContain('\n75\n'); // offsetX + width boundary of First Floor plot (45 + 30)
  });

  it('should safely handle partial or default regulatory data in affidavit PDF', async () => {
    const partialFormData: WizardFormData = {
      ...mockFormData,
      regulatory: {
        ownerName: '',
        fatherOrSpouseName: '',
        khasraNumber: '',
        khatauniNumber: '',
        authorityName: '',
        zone: '',
      },
    };

    const pdfBytes = await generateIndemnityAffidavitPDF(mockPlan, partialFormData);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    const loadedDoc = await PDFDocument.load(pdfBytes);
    expect(loadedDoc.getPageCount()).toBe(1);
  });

  it('should generate multi-sheet A3 landscape blueprint set PDF with 10 professional sheets', async () => {
    const multiFloorPlan: HousePlan = {
      ...mockPlan,
      floors: [
        {
          level: 0,
          floorName: 'Ground Floor & Stilt Parking',
          rooms: [
            { id: 'g-park', name: 'Covered Car Parking', x: 3, y: 10, width: 20, length: 30, doors: [], windows: [] },
            { id: 'g-gard', name: 'Backyard Garden', x: 3, y: 42, width: 20, length: 6, doors: [], windows: [] },
          ],
        },
        {
          level: 1,
          floorName: 'First Floor Plan',
          rooms: [
            { id: 'f1-bed1', name: 'Master Suite 1', x: 3, y: 10, width: 12, length: 14, doors: [], windows: [] },
          ],
        },
      ],
    };

    const pdfBytes = await generateArchitecturalBlueprintPDF(multiFloorPlan, mockFormData);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(2000);

    const doc = await PDFDocument.load(pdfBytes);
    expect(doc.getPageCount()).toBe(10);

    // Verify A3 Landscape dimensions (1191 x 842 pt)
    const page1 = doc.getPage(0);
    expect(page1.getWidth()).toBe(1191);
    expect(page1.getHeight()).toBe(842);
  });
});
