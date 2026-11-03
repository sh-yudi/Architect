import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/export-blueprint-pdf/route';
import { HousePlan } from '@/types/plan';
import { PDFDocument } from 'pdf-lib';

describe('Export Blueprint PDF API Route (/api/export-blueprint-pdf)', () => {
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
      {
        level: 1,
        floorName: 'First Floor Plan',
        rooms: [
          { id: 'f1', name: 'Master Suite 1', x: 3, y: 10, width: 12, length: 14, doors: [], windows: [] },
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

  it('should return 400 when plan payload is missing', async () => {
    const req = new Request('http://localhost:3000/api/export-blueprint-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Missing house plan payload');
  });

  it('should generate and return binary A3 PDF with 10 sheets on valid plan payload', async () => {
    const req = new Request('http://localhost:3000/api/export-blueprint-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: mockPlan }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('Architectural-Blueprint-Package-A3.pdf');

    const arrayBuffer = await res.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    expect(doc.getPageCount()).toBe(10);

    const firstPage = doc.getPage(0);
    expect(firstPage.getWidth()).toBe(1191);
    expect(firstPage.getHeight()).toBe(842);
  });
});
