import { NextResponse } from 'next/server';
import { generateArchitecturalBlueprintPDF } from '@/lib/export/blueprintPdf';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.plan) {
      return NextResponse.json({ error: 'Missing house plan payload' }, { status: 400 });
    }
    const { plan, formData } = body as { plan: HousePlan; formData?: WizardFormData };
    const pdfBytes = await generateArchitecturalBlueprintPDF(plan, formData || null);

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Architectural-Blueprint-Package-A3.pdf"',
      },
    });
  } catch (e) {
    console.error('Failed to generate blueprint PDF:', e);
    return NextResponse.json({ error: 'Blueprint PDF export failed' }, { status: 500 });
  }
}
