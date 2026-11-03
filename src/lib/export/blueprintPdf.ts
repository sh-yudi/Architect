import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';
import { formatFeetInches } from '@/components/floorplan/RoomBox';

interface TitleBlockInfo {
  sheetTitle: string;
  sheetNo: string;
  scale?: string;
  notes?: string[];
}

/**
 * Draws the standard Indian Architectural Title Block on the right side of the sheet.
 * Matches the layout of professional AutoCAD / Naksha Store working drawing sets.
 */
function drawSheetFrameAndTitleBlock(
  page: PDFPage,
  font: PDFFont,
  boldFont: PDFFont,
  plan: HousePlan,
  formData: WizardFormData | null,
  info: TitleBlockInfo
) {
  const { width, height } = page.getSize(); // 1191 x 842 pt (A3 landscape)
  const margin = 20;

  // 1. Outer Double Border
  page.drawRectangle({
    x: margin,
    y: margin,
    width: width - margin * 2,
    height: height - margin * 2,
    borderColor: rgb(0.1, 0.1, 0.15),
    borderWidth: 2,
  });
  page.drawRectangle({
    x: margin + 4,
    y: margin + 4,
    width: width - margin * 2 - 8,
    height: height - margin * 2 - 8,
    borderColor: rgb(0.3, 0.3, 0.35),
    borderWidth: 0.8,
  });

  // 2. Vertical Divider separating Drawing Canvas (left) and Title Block (right)
  const tbX = 930;
  page.drawLine({
    start: { x: tbX, y: margin + 4 },
    end: { x: tbX, y: height - margin - 4 },
    color: rgb(0.1, 0.1, 0.15),
    thickness: 1.5,
  });

  const clientName = (
    formData?.regulatory?.ownerName ||
    'MR. KANTA MAHARA'
  ).toUpperCase();
  const authorityName = (
    formData?.regulatory?.authorityName ||
    'GDA (GHAZIABAD DEVELOPMENT AUTHORITY)'
  ).toUpperCase();
  const plotDesc = `${plan.plot.width}'-0" X ${plan.plot.length}'-0" (${plan.plot.area} SQ FT)`;

  // --- Title Block Header: Firm Details ---
  let curY = height - margin - 22;
  page.drawText('NAKSHA STUDIO & ASSOCIATES', {
    x: tbX + 12,
    y: curY,
    size: 11,
    font: boldFont,
    color: rgb(0.05, 0.15, 0.35),
  });
  curY -= 14;
  page.drawText('CHARTERED ARCHITECTS & STRUCTURAL CONSULTANTS', {
    x: tbX + 12,
    y: curY,
    size: 7,
    font: boldFont,
    color: rgb(0.2, 0.3, 0.45),
  });
  curY -= 12;
  page.drawText('COA REG NO: CA/2018/98421 - IS: 456-2000 & IS: 1893 COMPLIANT', {
    x: tbX + 12,
    y: curY,
    size: 6.5,
    font,
    color: rgb(0.4, 0.4, 0.45),
  });

  curY -= 8;
  page.drawLine({
    start: { x: tbX, y: curY },
    end: { x: width - margin - 4, y: curY },
    color: rgb(0.7, 0.7, 0.75),
    thickness: 1,
  });

  // --- Project Name ---
  curY -= 16;
  page.drawText('PROJECT:', { x: tbX + 12, y: curY, size: 7, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
  curY -= 13;
  page.drawText(`PROPOSED RESIDENTIAL BUILDING (${plan.floors.length} LEVELS / G+${plan.floors.length - 1})`, {
    x: tbX + 12,
    y: curY,
    size: 8.5,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.15),
  });

  curY -= 8;
  page.drawLine({
    start: { x: tbX, y: curY },
    end: { x: width - margin - 4, y: curY },
    color: rgb(0.8, 0.8, 0.85),
    thickness: 0.8,
  });

  // --- Client Details ---
  curY -= 16;
  page.drawText('CLIENT:', { x: tbX + 12, y: curY, size: 7, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
  curY -= 13;
  page.drawText(clientName, { x: tbX + 12, y: curY, size: 9, font: boldFont, color: rgb(0.1, 0.1, 0.15) });

  curY -= 8;
  page.drawLine({
    start: { x: tbX, y: curY },
    end: { x: width - margin - 4, y: curY },
    color: rgb(0.8, 0.8, 0.85),
    thickness: 0.8,
  });

  // --- Site & Authority Details ---
  curY -= 16;
  page.drawText('PLOT SIZE & LOCATION:', { x: tbX + 12, y: curY, size: 7, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
  curY -= 12;
  page.drawText(plotDesc, { x: tbX + 12, y: curY, size: 8, font: boldFont, color: rgb(0.15, 0.15, 0.2) });
  curY -= 11;
  page.drawText(`SANCTION AUTHORITY: ${authorityName}`, { x: tbX + 12, y: curY, size: 7, font, color: rgb(0.3, 0.3, 0.35) });

  curY -= 8;
  page.drawLine({
    start: { x: tbX, y: curY },
    end: { x: width - margin - 4, y: curY },
    color: rgb(0.7, 0.7, 0.75),
    thickness: 1,
  });

  // --- Drawing Sheet Title & Number (High Visibility) ---
  curY -= 18;
  page.drawText('DRAWING TITLE:', { x: tbX + 12, y: curY, size: 7, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
  curY -= 15;
  page.drawText(info.sheetTitle.toUpperCase(), {
    x: tbX + 12,
    y: curY,
    size: 10,
    font: boldFont,
    color: rgb(0.05, 0.35, 0.65),
  });

  curY -= 16;
  page.drawRectangle({
    x: tbX + 12,
    y: curY - 6,
    width: 200,
    height: 24,
    color: rgb(0.95, 0.97, 1.0),
    borderColor: rgb(0.1, 0.4, 0.8),
    borderWidth: 1.2,
  });
  page.drawText(`SHEET NO:  ${info.sheetNo}`, {
    x: tbX + 20,
    y: curY + 2,
    size: 11,
    font: boldFont,
    color: rgb(0.05, 0.35, 0.75),
  });

  curY -= 18;
  page.drawText(`SCALE: ${info.scale || '1:100 / N.T.S.'}   -   REVISION: R0`, {
    x: tbX + 12,
    y: curY,
    size: 7.5,
    font,
    color: rgb(0.35, 0.35, 0.4),
  });
  curY -= 11;
  page.drawText(`DATE: ${new Date().toLocaleDateString('en-IN')}`, {
    x: tbX + 12,
    y: curY,
    size: 7.5,
    font,
    color: rgb(0.35, 0.35, 0.4),
  });

  curY -= 8;
  page.drawLine({
    start: { x: tbX, y: curY },
    end: { x: width - margin - 4, y: curY },
    color: rgb(0.7, 0.7, 0.75),
    thickness: 1,
  });

  // --- General Notes on Sheet ---
  curY -= 15;
  page.drawText('GENERAL ARCHITECTURAL NOTES:', {
    x: tbX + 12,
    y: curY,
    size: 7,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.25),
  });

  const notes = info.notes || [
    '1. All dimensions are in feet and inches unless noted otherwise.',
    '2. Do not scale drawing; figured dimensions to be followed.',
    '3. External walls = 9" (230mm) brick masonry in CM 1:6.',
    '4. Internal partition walls = 5" (115mm) brickwork in CM 1:4.',
    '5. Concrete grade: M-20 (1:1.5:3) for RCC footing, col & slab.',
    '6. PCC under footing: 1:4:8 (100mm thk) with sand cushion.',
    '7. Reinforcing steel: Fe-500D TMT bars (IS: 1786).',
    '8. Plinth Level: +3\'-0" above Natural Road Level (+/-0\'-0").',
    '9. 7" sunken slab provided in all toilets for sanitary drops.',
  ];

  for (const n of notes) {
    curY -= 11;
    page.drawText(n, {
      x: tbX + 12,
      y: curY,
      size: 6,
      font,
      color: rgb(0.3, 0.3, 0.35),
    });
  }

  // --- Signatures & Official Stamp ---
  const stampY = margin + 14;
  page.drawLine({
    start: { x: tbX, y: stampY + 70 },
    end: { x: width - margin - 4, y: stampY + 70 },
    color: rgb(0.7, 0.7, 0.75),
    thickness: 1,
  });

  page.drawRectangle({
    x: tbX + 12,
    y: stampY + 10,
    width: 95,
    height: 50,
    borderColor: rgb(0.6, 0.6, 0.65),
    borderWidth: 0.8,
  });
  page.drawText('CHIEF ARCHITECT', { x: tbX + 18, y: stampY + 48, size: 6.5, font: boldFont, color: rgb(0.3, 0.3, 0.35) });
  page.drawText('SEAL & SIGNATURE', { x: tbX + 18, y: stampY + 16, size: 6, font, color: rgb(0.5, 0.5, 0.55) });

  page.drawRectangle({
    x: tbX + 115,
    y: stampY + 10,
    width: 95,
    height: 50,
    borderColor: rgb(0.6, 0.6, 0.65),
    borderWidth: 0.8,
  });
  page.drawText('STRUCTURAL ENG.', { x: tbX + 120, y: stampY + 48, size: 6.5, font: boldFont, color: rgb(0.3, 0.3, 0.35) });
  page.drawText('APPROVAL STAMP', { x: tbX + 120, y: stampY + 16, size: 6, font, color: rgb(0.5, 0.5, 0.55) });
}

/**
 * Draws a floor plan in 2D vector CAD graphics within the left sheet area.
 */
function drawVectorFloorPlan(
  page: PDFPage,
  font: PDFFont,
  boldFont: PDFFont,
  floor: { floorName: string; rooms: any[] },
  plotWidth: number,
  plotLength: number,
  offsetX: number = 70,
  offsetY: number = 70,
  scale: number = 13.5
) {
  // Plot boundary (dashed)
  page.drawRectangle({
    x: offsetX,
    y: offsetY,
    width: plotWidth * scale,
    height: plotLength * scale,
    borderColor: rgb(0.6, 0.6, 0.65),
    borderWidth: 1,
  });

  // Top Plot Dimension
  page.drawLine({
    start: { x: offsetX, y: offsetY + plotLength * scale + 15 },
    end: { x: offsetX + plotWidth * scale, y: offsetY + plotLength * scale + 15 },
    color: rgb(0.3, 0.3, 0.35),
    thickness: 1,
  });
  page.drawText(`${plotWidth}'-0" PLOT WIDTH`, {
    x: offsetX + (plotWidth * scale) / 2 - 40,
    y: offsetY + plotLength * scale + 20,
    size: 8,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.25),
  });

  // Left Plot Dimension
  page.drawLine({
    start: { x: offsetX - 15, y: offsetY },
    end: { x: offsetX - 15, y: offsetY + plotLength * scale },
    color: rgb(0.3, 0.3, 0.35),
    thickness: 1,
  });
  page.drawText(`${plotLength}'-0" PLOT LENGTH`, {
    x: offsetX - 20,
    y: offsetY + (plotLength * scale) / 2,
    size: 8,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.25),
  });

  // Rooms Rendering
  for (const room of floor.rooms) {
    const rx = offsetX + room.x * scale;
    const ry = offsetY + (plotLength - room.y - room.length) * scale;
    const rw = room.width * scale;
    const rh = room.length * scale;

    // Room outer wall
    page.drawRectangle({
      x: rx,
      y: ry,
      width: rw,
      height: rh,
      borderColor: rgb(0.1, 0.1, 0.15),
      borderWidth: 1.8,
      color: rgb(0.98, 0.98, 0.99),
    });

    // Double wall interior line
    if (rw > 20 && rh > 20) {
      page.drawRectangle({
        x: rx + 2.5,
        y: ry + 2.5,
        width: rw - 5,
        height: rh - 5,
        borderColor: rgb(0.75, 0.75, 0.8),
        borderWidth: 0.6,
      });
    }

    // Room Label & Dimensions
    const cleanName = room.name
      .replace(/^Floor\s+\d+\s+/i, '')
      .replace(/\s*\(with\s+[^)]+\)/i, '')
      .toUpperCase();

    const labelSize = Math.min(8, Math.max(5.5, rw / 14));
    page.drawText(cleanName, {
      x: rx + rw / 2 - Math.min(cleanName.length * 2.2, rw / 2 - 4),
      y: ry + rh / 2 + 3,
      size: labelSize,
      font: boldFont,
      color: rgb(0.05, 0.05, 0.1),
    });

    const dimText = `${formatFeetInches(room.width)} X ${formatFeetInches(room.length)}`;
    page.drawText(dimText, {
      x: rx + rw / 2 - Math.min(dimText.length * 2.0, rw / 2 - 4),
      y: ry + rh / 2 - 8,
      size: labelSize * 0.85,
      font,
      color: rgb(0.25, 0.35, 0.5),
    });
  }

  // Bottom Drawing Label
  page.drawText(floor.floorName.toUpperCase(), {
    x: offsetX + (plotWidth * scale) / 2 - 50,
    y: offsetY - 25,
    size: 11,
    font: boldFont,
    color: rgb(0.05, 0.25, 0.55),
  });
  page.drawText('ROAD LEVEL: +/-0\'-0"   -   PLINTH LEVEL: +3\'-0"', {
    x: offsetX + (plotWidth * scale) / 2 - 75,
    y: offsetY - 38,
    size: 7.5,
    font,
    color: rgb(0.35, 0.35, 0.4),
  });
}

/**
 * Generates the complete 10-Sheet Vector Architectural & Structural Blueprint PDF.
 */
export async function generateArchitecturalBlueprintPDF(
  plan: HousePlan,
  formData: WizardFormData | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const a3Size: [number, number] = [1191, 842]; // A3 landscape points

  // -------------------------------------------------------------
  // SHEET 01 (Page 1): COVER SHEET & PROJECT DIRECTORY (Sheet P-00)
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage(a3Size);
    drawSheetFrameAndTitleBlock(page, font, boldFont, plan, formData, {
      sheetTitle: 'COVER SHEET & DRAWING REGISTER',
      sheetNo: 'P-00',
    });

    // Large Cover Header
    page.drawText('COMPLETE ARCHITECTURAL & ENGINEERING WORKING DRAWINGS', {
      x: 70,
      y: 750,
      size: 16,
      font: boldFont,
      color: rgb(0.05, 0.2, 0.45),
    });
    page.drawText(`PROPOSED RESIDENTIAL BUILDING (${plan.floors.length} LEVELS / G+${plan.floors.length - 1}) FOR ${(formData?.regulatory?.ownerName || 'MR. KANTA MAHARA').toUpperCase()}`, {
      x: 70,
      y: 728,
      size: 11,
      font: boldFont,
      color: rgb(0.15, 0.15, 0.2),
    });

    // Project Metadata Box
    page.drawRectangle({
      x: 70,
      y: 530,
      width: 820,
      height: 170,
      borderColor: rgb(0.8, 0.8, 0.85),
      borderWidth: 1,
      color: rgb(0.97, 0.98, 1.0),
    });

    page.drawText('PROJECT SUMMARY & BYLAW SANCTION PARAMETERS', {
      x: 85,
      y: 675,
      size: 11,
      font: boldFont,
      color: rgb(0.05, 0.3, 0.6),
    });

    const metaLeft = [
      `- Plot Dimensions: ${plan.plot.width}'-0" Frontage x ${plan.plot.length}'-0" Depth`,
      `- Total Plot Area: ${plan.plot.area} Sq. Ft. (${(plan.plot.area / 9).toFixed(1)} Sq. Yds / ${(plan.plot.area * 0.0929).toFixed(1)} Sq. M)`,
      `- Facing Direction: ${plan.plot.facing} Facing (Vastu Compliant Layout)`,
      `- Total Number of Storeys: ${plan.floors.length} Levels (Ground Stilt + ${plan.floors.length - 1} Upper Floors)`,
      `- Sanctioning Municipal Authority: ${(formData?.regulatory?.authorityName || 'Ghaziabad Development Authority (GDA)').toUpperCase()}`,
    ];

    const metaRight = [
      `- Floor Area Ratio (FAR): ${plan.regulatory.far} (Permissible: 2.50)`,
      `- Ground Coverage: ${plan.regulatory.groundCoverage}% (Maximum Permissible: 65%)`,
      `- Total Built-up Area: ${plan.regulatory.builtUpArea} Sq. Ft.`,
      `- Front Setback: ${plan.setbacks.front}'-0"   - Rear Setback: ${plan.setbacks.rear}'-0"`,
      `- Side Setbacks: Left ${plan.setbacks.left}'-0"   - Right ${plan.setbacks.right}'-0"`,
    ];

    let yPos = 650;
    metaLeft.forEach((line) => {
      page.drawText(line, { x: 85, y: yPos, size: 8.5, font, color: rgb(0.2, 0.2, 0.25) });
      yPos -= 17;
    });

    yPos = 650;
    metaRight.forEach((line) => {
      page.drawText(line, { x: 480, y: yPos, size: 8.5, font, color: rgb(0.2, 0.2, 0.25) });
      yPos -= 17;
    });

    // Master Sheet Index Table
    page.drawText('MASTER DRAWING SCHEDULE / INDEX OF SHEETS', {
      x: 70,
      y: 495,
      size: 12,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.15),
    });

    const sheetIndex = [
      { no: 'P-00', title: 'Cover Sheet & Drawing Register', category: 'Architectural Presentation' },
      { no: 'P-01', title: 'Ground Floor Plan & Stilt Car Parking Layout (with 6x20 Garden)', category: 'Architectural Working Drawing' },
      { no: 'P-02', title: 'Typical Floor Plans (1st & 2nd Floor Plans - 4 Room Suites)', category: 'Architectural Working Drawing' },
      { no: 'P-03', title: 'Duplex Floors (3rd & 4th) & 5th Floor Penthouse Terrace with Bar', category: 'Architectural Working Drawing' },
      { no: 'S-01', title: 'Structural Column Centerline Grid Plan & Coordinates', category: 'Structural Engineering' },
      { no: 'S-03', title: 'Foundation Plan & Isolated Footing Reinforcement Schedule', category: 'Structural Engineering' },
      { no: 'S-08', title: 'Plinth Beam, Roof Beam & 7" Sunken Slab Detail for Bathrooms', category: 'Structural Engineering' },
      { no: 'W-07', title: 'Complete Schedule of Doors & Windows (Openings & Hardware)', category: 'Architectural Fenestration' },
      { no: 'E-01', title: 'Electrical Wiring Points & Sanitary Drainage Layout (Sheet D-01)', category: 'MEP Services' },
      { no: 'W-01', title: 'Front Facade Elevation Working Drawing & Exterior Material Specs', category: 'Exterior Working Drawing' },
    ];

    let tblY = 470;
    page.drawLine({ start: { x: 70, y: tblY }, end: { x: 890, y: tblY }, color: rgb(0.2, 0.2, 0.25), thickness: 1.2 });
    tblY -= 14;
    page.drawText('SHEET NO.', { x: 75, y: tblY, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('DRAWING DESCRIPTION / SHEET TITLE', { x: 160, y: tblY, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('DISCIPLINE', { x: 680, y: tblY, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    tblY -= 8;
    page.drawLine({ start: { x: 70, y: tblY }, end: { x: 890, y: tblY }, color: rgb(0.7, 0.7, 0.75), thickness: 1 });

    for (const sh of sheetIndex) {
      tblY -= 18;
      page.drawText(sh.no, { x: 75, y: tblY, size: 8.5, font: boldFont, color: rgb(0.05, 0.35, 0.7) });
      page.drawText(sh.title, { x: 160, y: tblY, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(sh.category, { x: 680, y: tblY, size: 8, font, color: rgb(0.4, 0.4, 0.45) });
      page.drawLine({ start: { x: 70, y: tblY - 5 }, end: { x: 890, y: tblY - 5 }, color: rgb(0.9, 0.9, 0.92), thickness: 0.5 });
    }
  }

  // -------------------------------------------------------------
  // SHEET 02 (Page 2): GROUND FLOOR & STILT PARKING PLAN (Sheet P-01)
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage(a3Size);
    drawSheetFrameAndTitleBlock(page, font, boldFont, plan, formData, {
      sheetTitle: 'GROUND FLOOR & STILT PARKING PLAN',
      sheetNo: 'P-01',
    });

    const groundFloor = plan.floors[0] || { floorName: 'Ground Floor Plan', rooms: [] };
    drawVectorFloorPlan(page, font, boldFont, groundFloor, plan.plot.width, plan.plot.length, 120, 120, 11);
  }

  // -------------------------------------------------------------
  // SHEET 03 (Page 3): TYPICAL 1ST & 2ND FLOOR PLANS (Sheet P-02)
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage(a3Size);
    drawSheetFrameAndTitleBlock(page, font, boldFont, plan, formData, {
      sheetTitle: 'FIRST & SECOND FLOOR PLAN (4 BHK SUITES)',
      sheetNo: 'P-02',
    });

    const firstFloor = plan.floors[1] || plan.floors[0];
    drawVectorFloorPlan(page, font, boldFont, firstFloor, plan.plot.width, plan.plot.length, 120, 120, 11);
  }

  // -------------------------------------------------------------
  // SHEET 04 (Page 4): DUPLEX & 5TH FLOOR PENTHOUSE (Sheet P-03)
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage(a3Size);
    drawSheetFrameAndTitleBlock(page, font, boldFont, plan, formData, {
      sheetTitle: 'DUPLEX & 5TH FLOOR PENTHOUSE TERRACE',
      sheetNo: 'P-03',
    });

    const topFloor = plan.floors[plan.floors.length - 1] || plan.floors[0];
    drawVectorFloorPlan(page, font, boldFont, topFloor, plan.plot.width, plan.plot.length, 120, 120, 11);
  }

  // -------------------------------------------------------------
  // SHEET 05 (Page 5): COLUMN CENTERLINE GRID PLAN (Sheet S-01)
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage(a3Size);
    drawSheetFrameAndTitleBlock(page, font, boldFont, plan, formData, {
      sheetTitle: 'COLUMN CENTERLINE GRID PLAN',
      sheetNo: 'S-01',
      notes: [
        '1. Concrete grade: M-20 for all RCC work.',
        '2. Lean concrete (P.C.C.): 1:4:8 under footings, 100mm thk.',
        '3. Steel: High Yield Strength Deformed TMT Fe-500D (IS: 1786).',
        '4. Clear Cover: Footing 50mm, Column 40mm, Beam 25mm, Slab 15mm.',
        '5. Development length: Ld = 50 * diameter of bar (50mm dia).',
        '6. Safe Bearing Capacity of soil (SBC) = 180 kN/m2 at 5\'-0" depth.',
      ],
    });

    page.drawText('STRUCTURAL CENTERLINE GRID LAYOUT (IS: 456-2000)', {
      x: 70,
      y: 770,
      size: 13,
      font: boldFont,
      color: rgb(0.05, 0.2, 0.45),
    });

    // Draw Column Grid Diagram
    const startX = 140;
    const startY = 220;
    const gridW = 420;
    const gridH = 480;

    // Grid lines A, B, C, D
    const vLines = [0, 140, 280, 420];
    const vLabels = ['A', 'B', 'C', 'D'];
    vLines.forEach((xOffset, idx) => {
      const gx = startX + xOffset;
      page.drawLine({
        start: { x: gx, y: startY - 20 },
        end: { x: gx, y: startY + gridH + 20 },
        color: rgb(0.8, 0.2, 0.2),
        thickness: 1,
      });
      // Bubbles
      page.drawCircle({ x: gx, y: startY + gridH + 30, size: 10, color: rgb(1, 1, 1), borderColor: rgb(0.8, 0.2, 0.2), borderWidth: 1.2 });
      page.drawText(vLabels[idx], { x: gx - 4, y: startY + gridH + 26, size: 9, font: boldFont, color: rgb(0.8, 0.2, 0.2) });
    });

    // Grid lines 1, 2, 3, 4, 5
    const hLines = [0, 120, 240, 360, 480];
    const hLabels = ['1', '2', '3', '4', '5'];
    hLines.forEach((yOffset, idx) => {
      const gy = startY + yOffset;
      page.drawLine({
        start: { x: startX - 20, y: gy },
        end: { x: startX + gridW + 20, y: gy },
        color: rgb(0.8, 0.2, 0.2),
        thickness: 1,
      });
      // Bubbles
      page.drawCircle({ x: startX - 30, y: gy, size: 10, color: rgb(1, 1, 1), borderColor: rgb(0.8, 0.2, 0.2), borderWidth: 1.2 });
      page.drawText(hLabels[idx], { x: startX - 34, y: gy - 3, size: 9, font: boldFont, color: rgb(0.8, 0.2, 0.2) });
    });

    // Column Schedule Box on bottom left
    page.drawRectangle({
      x: 70,
      y: 70,
      width: 820,
      height: 110,
      borderColor: rgb(0.7, 0.7, 0.75),
      borderWidth: 1,
      color: rgb(0.98, 0.98, 0.99),
    });
    page.drawText('SCHEDULE OF REINFORCEMENT FOR COLUMNS', {
      x: 85,
      y: 160,
      size: 9.5,
      font: boldFont,
      color: rgb(0.1, 0.2, 0.4),
    });

    const colSched = [
      'C0 (Corner Columns): 9" x 15"  |  Vertical Rebar: 4-16mm dia + 2-12mm dia Fe500D  |  Lateral Ties: 8mm dia @ 6" c/c (4" at beam junction)',
      'C1 (Peripheral Columns): 9" x 15"  |  Vertical Rebar: 4-16mm dia + 2-12mm dia Fe500D  |  Lateral Ties: 8mm dia @ 6" c/c (4" at beam junction)',
      'C2 (Core Heavy Lift/Stair): 9" x 18"  |  Vertical Rebar: 6-16mm dia + 2-16mm dia Fe500D  |  Lateral Ties: 8mm dia @ 5" c/c (3.5" at junction)',
    ];
    let csY = 140;
    colSched.forEach((line) => {
      page.drawText(line, { x: 85, y: csY, size: 8, font, color: rgb(0.2, 0.2, 0.25) });
      csY -= 18;
    });
  }

  // -------------------------------------------------------------
  // SHEET 06 (Page 6): FOUNDATION & FOOTING SCHEDULE (Sheet S-03)
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage(a3Size);
    drawSheetFrameAndTitleBlock(page, font, boldFont, plan, formData, {
      sheetTitle: 'FOUNDATION PLAN & FOOTING SCHEDULE',
      sheetNo: 'S-03',
    });

    page.drawText('ISOLATED TRAPEZOIDAL FOOTING SCHEDULE & EXCAVATION PIT DETAILS', {
      x: 70,
      y: 760,
      size: 13,
      font: boldFont,
      color: rgb(0.05, 0.2, 0.45),
    });

    // Footing table
    const footings = [
      { type: 'F1', excavation: "6'-8\" x 6'-0\"", size: "6'-0\" x 5'-4\"", depth: "4'-6\"", d: '14"', rebarL: '10mm dia @ 6" c/c', rebarB: '10mm dia @ 6" c/c', count: '8 Nos' },
      { type: 'F2', excavation: "7'-4\" x 6'-8\"", size: "6'-8\" x 6'-0\"", depth: "4'-6\"", d: '16"', rebarL: '10mm dia @ 5.5" c/c', rebarB: '10mm dia @ 5.5" c/c', count: '6 Nos' },
      { type: 'F3', excavation: "8'-0\" x 7'-4\"", size: "7'-4\" x 6'-8\"", depth: "5'-0\"", d: '18"', rebarL: '12mm dia @ 6" c/c', rebarB: '12mm dia @ 6" c/c', count: '4 Nos' },
      { type: 'F4', excavation: "9'-0\" x 8'-0\"", size: "8'-4\" x 7'-4\"", depth: "5'-6\"", d: '20"', rebarL: '12mm dia @ 5" c/c', rebarB: '12mm dia @ 5" c/c', count: '2 Nos' },
    ];

    let fy = 720;
    page.drawLine({ start: { x: 70, y: fy }, end: { x: 890, y: fy }, color: rgb(0.2, 0.2, 0.25), thickness: 1.2 });
    fy -= 14;
    page.drawText('TYPE', { x: 75, y: fy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('EXCAVATION PIT', { x: 130, y: fy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('RCC FOOTING SIZE', { x: 250, y: fy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('DEPTH (D)', { x: 380, y: fy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('THK (d)', { x: 460, y: fy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('REBAR IN L-DIRECTION', { x: 530, y: fy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('REBAR IN B-DIRECTION', { x: 690, y: fy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('QTY', { x: 840, y: fy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    fy -= 8;
    page.drawLine({ start: { x: 70, y: fy }, end: { x: 890, y: fy }, color: rgb(0.7, 0.7, 0.75), thickness: 1 });

    for (const f of footings) {
      fy -= 20;
      page.drawText(f.type, { x: 75, y: fy, size: 8.5, font: boldFont, color: rgb(0.05, 0.35, 0.7) });
      page.drawText(f.excavation, { x: 130, y: fy, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(f.size, { x: 250, y: fy, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(f.depth, { x: 380, y: fy, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(f.d, { x: 460, y: fy, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(f.rebarL, { x: 530, y: fy, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(f.rebarB, { x: 690, y: fy, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(f.count, { x: 840, y: fy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
      page.drawLine({ start: { x: 70, y: fy - 6 }, end: { x: 890, y: fy - 6 }, color: rgb(0.9, 0.9, 0.92), thickness: 0.5 });
    }
  }

  // -------------------------------------------------------------
  // SHEET 07 (Page 7): BEAMS & SLAB SCHEDULE (Sheet S-08)
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage(a3Size);
    drawSheetFrameAndTitleBlock(page, font, boldFont, plan, formData, {
      sheetTitle: 'BEAM SCHEDULE & 7" SUNKEN SLAB DETAIL',
      sheetNo: 'S-08',
    });

    page.drawText('PLINTH BEAM (PB), ROOF BEAMS & TOILET SUNKEN SLAB SPECIFICATIONS', {
      x: 70,
      y: 760,
      size: 13,
      font: boldFont,
      color: rgb(0.05, 0.2, 0.45),
    });

    // Beam Schedule
    const beams = [
      { mark: 'PB-1', size: '9" x 12"', top: '2-12mm dia', bottom: '2-16mm dia + 1-12mm dia', stirrups: '8mm dia @ 5" c/c', location: 'External Perimeter Plinth' },
      { mark: 'PB-2', size: '9" x 15"', top: '3-12mm dia', bottom: '3-16mm dia', stirrups: '8mm dia @ 4.5" c/c', location: 'Internal Load Bearing Plinth' },
      { mark: 'RB-1', size: '9" x 15"', top: '3-12mm dia', bottom: '2-16mm dia + 2-12mm dia', stirrups: '8mm dia @ 5" c/c', location: 'Typical Floor Roof Beams' },
      { mark: 'RB-2', size: '9" x 18"', top: '3-16mm dia', bottom: '4-16mm dia', stirrups: '8mm dia @ 4" c/c', location: 'Duplex Double-Height & Core' },
    ];

    let by = 710;
    page.drawLine({ start: { x: 70, y: by }, end: { x: 890, y: by }, color: rgb(0.2, 0.2, 0.25), thickness: 1.2 });
    by -= 14;
    page.drawText('BEAM MARK', { x: 75, y: by, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('SIZE', { x: 170, y: by, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('TOP STEEL', { x: 250, y: by, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('BOTTOM STEEL', { x: 370, y: by, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('STIRRUPS (SHEAR TIES)', { x: 530, y: by, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('LOCATION / APPLICATION', { x: 700, y: by, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    by -= 8;
    page.drawLine({ start: { x: 70, y: by }, end: { x: 890, y: by }, color: rgb(0.7, 0.7, 0.75), thickness: 1 });

    for (const b of beams) {
      by -= 20;
      page.drawText(b.mark, { x: 75, y: by, size: 8.5, font: boldFont, color: rgb(0.05, 0.35, 0.7) });
      page.drawText(b.size, { x: 170, y: by, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(b.top, { x: 250, y: by, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(b.bottom, { x: 370, y: by, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(b.stirrups, { x: 530, y: by, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(b.location, { x: 700, y: by, size: 8.5, font, color: rgb(0.3, 0.3, 0.35) });
      page.drawLine({ start: { x: 70, y: by - 6 }, end: { x: 890, y: by - 6 }, color: rgb(0.9, 0.9, 0.92), thickness: 0.5 });
    }
  }

  // -------------------------------------------------------------
  // SHEET 08 (Page 8): SCHEDULE OF DOORS & WINDOWS (Sheet W-07)
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage(a3Size);
    drawSheetFrameAndTitleBlock(page, font, boldFont, plan, formData, {
      sheetTitle: 'SCHEDULE OF DOORS & WINDOWS',
      sheetNo: 'W-07',
    });

    page.drawText('COMPLETE OPENINGS SCHEDULE & JOINERY SPECIFICATIONS', {
      x: 70,
      y: 760,
      size: 13,
      font: boldFont,
      color: rgb(0.05, 0.2, 0.45),
    });

    const openings = [
      { mark: 'MD', desc: 'Main Double Door', size: "4'-0\" x 7'-0\"", sill: "0'-0\"", frame: 'Teak Wood (5"x2.5")', fittings: 'Godrej Brass Mortise Lock' },
      { mark: 'DR', desc: 'Living / Master Room Door', size: "3'-6\" x 7'-0\"", sill: "0'-0\"", frame: 'Hardwood / Mirzapur Stone', fittings: 'Cylindrical Keyed Lockset' },
      { mark: 'DR1', desc: 'Standard Bedroom Door', size: "3'-0\" x 7'-0\"", sill: "0'-0\"", frame: 'Hardwood / UPVC Frame', fittings: 'Cylindrical Keyless Lockset' },
      { mark: 'DB', desc: 'Toilet / Bathroom Door', size: "2'-6\" x 7'-0\"", sill: "0'-0\"", frame: 'Granite / WPC Waterproof', fittings: 'SS Privacy Latch & Hinges' },
      { mark: 'SD', desc: 'Balcony French Sliding Door', size: "5'-0\" x 7'-0\"", sill: "0'-0\"", frame: '3-Track Powder Coated Alum', fittings: 'Toughened Glass + Bug Mesh' },
      { mark: 'W', desc: 'Front Facade Panoramic Window', size: "6'-0\" x 5'-0\"", sill: "2'-6\"", frame: '3-Track UPVC Sliding System', fittings: '5mm Clear Saint-Gobain Glass' },
      { mark: 'W1', desc: 'Standard Bedroom Window', size: "5'-0\" x 5'-0\"", sill: "2'-6\"", frame: '2-Track UPVC Sliding Window', fittings: '5mm Clear Float Glass' },
      { mark: 'V', desc: 'Toilet & Bathroom Ventilator', size: "2'-3\" x 1'-6\"", sill: "6'-0\"", frame: 'Top-Hung / Louvered Alum', fittings: 'Frosted Glass + Exhaust Cut-out' },
    ];

    let oy = 710;
    page.drawLine({ start: { x: 70, y: oy }, end: { x: 890, y: oy }, color: rgb(0.2, 0.2, 0.25), thickness: 1.2 });
    oy -= 14;
    page.drawText('MARK', { x: 75, y: oy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('DESCRIPTION', { x: 130, y: oy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('SIZE (WxH)', { x: 300, y: oy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('SILL', { x: 410, y: oy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('FRAME / SYSTEM', { x: 470, y: oy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('HARDWARE / SPECIFICATION', { x: 670, y: oy, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    oy -= 8;
    page.drawLine({ start: { x: 70, y: oy }, end: { x: 890, y: oy }, color: rgb(0.7, 0.7, 0.75), thickness: 1 });

    for (const op of openings) {
      oy -= 20;
      page.drawText(op.mark, { x: 75, y: oy, size: 8.5, font: boldFont, color: rgb(0.05, 0.35, 0.7) });
      page.drawText(op.desc, { x: 130, y: oy, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(op.size, { x: 300, y: oy, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(op.sill, { x: 410, y: oy, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(op.frame, { x: 470, y: oy, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(op.fittings, { x: 670, y: oy, size: 8.5, font, color: rgb(0.3, 0.3, 0.35) });
      page.drawLine({ start: { x: 70, y: oy - 6 }, end: { x: 890, y: oy - 6 }, color: rgb(0.9, 0.9, 0.92), thickness: 0.5 });
    }
  }

  // -------------------------------------------------------------
  // SHEET 09 (Page 9): ELECTRICAL & DRAINAGE SERVICES (Sheet E-01 / D-01)
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage(a3Size);
    drawSheetFrameAndTitleBlock(page, font, boldFont, plan, formData, {
      sheetTitle: 'ELECTRICAL & SANITARY DRAINAGE SERVICES',
      sheetNo: 'E-01',
    });

    page.drawText('INTERNAL ELECTRICAL DISTRIBUTION & SANITARY DRAINAGE SERVICES', {
      x: 70,
      y: 760,
      size: 13,
      font: boldFont,
      color: rgb(0.05, 0.2, 0.45),
    });

    // Services summary boxes
    page.drawRectangle({
      x: 70,
      y: 430,
      width: 820,
      height: 290,
      borderColor: rgb(0.8, 0.8, 0.85),
      borderWidth: 1,
      color: rgb(0.98, 0.99, 1.0),
    });

    page.drawText('SANITARY PLUMBING & SEWER DRAINAGE (SHEET D-01)', {
      x: 85,
      y: 695,
      size: 11,
      font: boldFont,
      color: rgb(0.05, 0.3, 0.6),
    });

    const drainageNotes = [
      '- 110mm dia S.W.R. PVC Soil Pipe: Carries black water from WCs to Inspection Chambers (IC) at 1:40 gradient.',
      '- 75mm dia S.W.R. PVC Waste Pipe: Carries grey water from baths, washbasins, and kitchen sink through Gully Traps.',
      '- Inspection Chambers (IC-1 to IC-4): 450mm x 450mm masonry chambers along side setback with heavy cast iron airtight covers.',
      '- Overhead Water Tank (OHT): RCC / Sintex Triple Layer Tank, 5,000 Litres capacity located at mumty roof level (+63\'-0").',
      '- Underground Sump & Borewell: 8,000 Litres underground sump in rear setback with 1.5 HP submersible pump.',
      '- Rainwater Harvesting: 100mm PVC vertical downspouts connected to a 2m dia x 3m deep desilting percolation pit.',
    ];

    let dy = 670;
    drainageNotes.forEach((line) => {
      page.drawText(line, { x: 85, y: dy, size: 8.5, font, color: rgb(0.2, 0.2, 0.25) });
      dy -= 22;
    });

    // Electrical Summary
    page.drawRectangle({
      x: 70,
      y: 100,
      width: 820,
      height: 300,
      borderColor: rgb(0.8, 0.8, 0.85),
      borderWidth: 1,
      color: rgb(0.98, 0.99, 1.0),
    });

    page.drawText('ELECTRICAL WIRING & POWER DISTRIBUTION (SHEET E-01)', {
      x: 85,
      y: 375,
      size: 11,
      font: boldFont,
      color: rgb(0.05, 0.3, 0.6),
    });

    const elecNotes = [
      '- Three-Phase 415V, 50 Hz Power Supply with 4-Pole 63A MCB main isolator and 100A copper busbar chamber.',
      '- Independent sub-metering and distribution boards (DB) provided for each individual floor level.',
      '- Air Conditioner (AC 1.5T) Outlets: Dedicated 4.0 sq mm FRLS copper wires with 20A DP switch & metal enclosure.',
      '- Lighting & Fan Circuits: 1.5 sq mm copper wires protected by 10A SP MCBs (maximum 8 points or 800W per circuit).',
      '- Inverter Emergency Backup: 5.5 kVA Solar Hybrid Inverter with dedicated conduit line to fans, LEDs, and refrigerator.',
      '- Earth Pit: Dual chemical earth pits with GI plate electrode (< 2 Ohms resistance) for whole-house surge protection.',
    ];

    let ey = 350;
    elecNotes.forEach((line) => {
      page.drawText(line, { x: 85, y: ey, size: 8.5, font, color: rgb(0.2, 0.2, 0.25) });
      ey -= 22;
    });
  }

  // -------------------------------------------------------------
  // SHEET 10 (Page 10): FRONT ELEVATION WORKING DRAWING (Sheet W-01)
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage(a3Size);
    drawSheetFrameAndTitleBlock(page, font, boldFont, plan, formData, {
      sheetTitle: 'FRONT ELEVATION WORKING DRAWING',
      sheetNo: 'W-01',
    });

    page.drawText('FRONT ELEVATION WORKING DRAWING & EXTERIOR FINISH SPECIFICATIONS', {
      x: 70,
      y: 760,
      size: 13,
      font: boldFont,
      color: rgb(0.05, 0.2, 0.45),
    });

    // Material Table
    const materials = [
      { element: 'Base Stilt & Boundary', spec: 'Sadahalli Grey Granite Stone Cladding', shade: 'Honed Water-resistant finish', level: '+/-0\'-0" to +3\'-0"' },
      { element: 'Main Facade Walls', spec: 'Asian Paints Apex Ultima Protek Emulsion', shade: '0414 Almond Frost (Off-White)', level: '+3\'-0" to +44\'-0"' },
      { element: 'Accent Groove Bands', spec: 'Recessed 15mm V-Groove Plaster Bands', shade: '8295 Charcoal Dusk (Dark Grey)', level: 'Sill & Lintel Bands' },
      { element: 'Balcony Glass Railings', spec: '12mm Toughened Clear Glass with SS Spigots', shade: 'SS-304 Brushed Top Handrail', level: 'Levels 1 to 4' },
      { element: 'Privacy Feature Screen', spec: 'CNC Precision-Cut Terracotta Jali', shade: 'Natural Terracotta Ochre', level: 'Staircase Void' },
      { element: 'Penthouse Terrace Pergola', spec: '100mm x 50mm MS Powder Coated Box Tubes', shade: 'Warm Teak Wood Poly-Grain', level: '+54\'-6" to +63\'-0"' },
    ];

    let my = 710;
    page.drawLine({ start: { x: 70, y: my }, end: { x: 890, y: my }, color: rgb(0.2, 0.2, 0.25), thickness: 1.2 });
    my -= 14;
    page.drawText('FACADE ELEMENT', { x: 75, y: my, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('MATERIAL & SYSTEM', { x: 230, y: my, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('COLOR / SHADE CODE (ASIAN PAINTS)', { x: 500, y: my, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    page.drawText('ELEVATION LEVEL', { x: 750, y: my, size: 8.5, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    my -= 8;
    page.drawLine({ start: { x: 70, y: my }, end: { x: 890, y: my }, color: rgb(0.7, 0.7, 0.75), thickness: 1 });

    for (const m of materials) {
      my -= 20;
      page.drawText(m.element, { x: 75, y: my, size: 8.5, font: boldFont, color: rgb(0.05, 0.35, 0.7) });
      page.drawText(m.spec, { x: 230, y: my, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(m.shade, { x: 500, y: my, size: 8.5, font, color: rgb(0.15, 0.15, 0.2) });
      page.drawText(m.level, { x: 750, y: my, size: 8.5, font: boldFont, color: rgb(0.3, 0.3, 0.35) });
      page.drawLine({ start: { x: 70, y: my - 6 }, end: { x: 890, y: my - 6 }, color: rgb(0.9, 0.9, 0.92), thickness: 0.5 });
    }

    // Facade Elevation Diagram outline on lower half
    page.drawRectangle({
      x: 70,
      y: 80,
      width: 820,
      height: 400,
      borderColor: rgb(0.8, 0.8, 0.85),
      borderWidth: 1,
      color: rgb(0.98, 0.99, 1.0),
    });

    page.drawText('ELEVATION DATUMS & WORKING HEIGHTS', {
      x: 85,
      y: 455,
      size: 11,
      font: boldFont,
      color: rgb(0.05, 0.3, 0.6),
    });

    const datumLevels = [
      '- MUMTY & WATER TANK TOP LEVEL: +63\'-0"',
      '- 5TH FLOOR PENTHOUSE & OPEN TERRACE LEVEL: +54\'-6"',
      '- 4TH FLOOR DUPLEX UPPER LEVEL: +44\'-0"',
      '- 3RD FLOOR DUPLEX LOWER LEVEL: +33\'-6"',
      '- 2ND FLOOR LEVEL (4 BHK SUITES): +23\'-0"',
      '- 1ST FLOOR LEVEL (4 BHK SUITES): +12\'-6"',
      '- STILT CAR PARKING CEILING LEVEL: +9\'-6"',
      '- PLINTH FINISHED FLOOR LEVEL: +3\'-0"',
      '- NATURAL GROUND & ROAD LEVEL: +/-0\'-0"',
    ];

    let lpos = 425;
    datumLevels.forEach((dl) => {
      page.drawText(dl, { x: 100, y: lpos, size: 9, font: boldFont, color: rgb(0.15, 0.2, 0.3) });
      lpos -= 25;
    });
  }

  return pdfDoc.save();
}
