import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';

export async function generateIndemnityAffidavitPDF(
  plan: HousePlan,
  formData: WizardFormData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let y = height - 50;

  const ownerName = (formData.regulatory?.ownerName || 'OWNER').toUpperCase();
  const fatherOrSpouseName = (formData.regulatory?.fatherOrSpouseName || 'FATHER/SPOUSE').toUpperCase();
  const khasraNumber = formData.regulatory?.khasraNumber || 'N/A';
  const khatauniNumber = formData.regulatory?.khatauniNumber || 'N/A';
  const city = formData.plot?.city || 'Ghaziabad';
  const state = formData.plot?.state || 'UP';
  const pincode = formData.plot?.pincode || '201001';

  // Header
  page.drawText('BEFORE THE GHAZIABAD DEVELOPMENT AUTHORITY (GDA)', {
    x: 70,
    y,
    size: 13,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.2),
  });

  y -= 25;
  page.drawText('INDEMNITY BOND & AFFIDAVIT FOR BUILDING PLAN APPROVAL', {
    x: 80,
    y,
    size: 11,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  y -= 40;
  const content = [
    `I, ${ownerName}, son/daughter/spouse of ${fatherOrSpouseName},`,
    `resident of Plot / Khasra No. ${khasraNumber}, Khatauni No. ${khatauniNumber},`,
    `situated at ${city}, ${state} (${pincode}), do hereby solemnly affirm and declare:`,
    '',
    `1. That I am the lawful owner in possession of the said residential plot measuring ${plan.plot.area} sq. ft.`,
    `   (${plan.plot.width} ft. front x ${plan.plot.length} ft. depth), facing ${plan.plot.facing}.`,
    '',
    `2. That the proposed construction consists of ${plan.floors.length} levels with a total built-up area of ${plan.regulatory.builtUpArea} sq. ft.,`,
    `   adhering to GDA FAR of ${plan.regulatory.far} and Ground Coverage of ${plan.regulatory.groundCoverage}%.`,
    '',
    `3. That the setbacks provided (Front: ${plan.setbacks.front} ft, Rear: ${plan.setbacks.rear} ft, Side: ${plan.setbacks.left} ft)`,
    `   fully comply with the Uttar Pradesh Urban Planning & Development Act and GDA Building By-laws.`,
    '',
    `4. That I shall abide by all conditions stipulated in the sanction letter and shall construct strictly`,
    `   in accordance with the approved CAD drawings submitted through the UPOBPAS portal.`,
    '',
    '',
    'Deponent Signature: _______________________',
    `Date: ${new Date().toLocaleDateString('en-IN')}`,
    'Place: Ghaziabad',
  ];

  for (const line of content) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10,
      font: line.startsWith('Deponent') ? boldFont : font,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 18;
  }

  return pdfDoc.save();
}
