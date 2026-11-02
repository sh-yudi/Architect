import { NextResponse } from 'next/server';
import { generateIndemnityAffidavitPDF } from '@/lib/export/affidavitPdf';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';

export async function POST(req: Request) {
  try {
    const { plan, formData } = (await req.json()) as { plan: HousePlan; formData: WizardFormData };
    if (!plan || !formData) {
      return NextResponse.json({ error: 'PDF export failed' }, { status: 500 });
    }
    const pdfBytes = await generateIndemnityAffidavitPDF(plan, formData);

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="gda-approval-affidavit.pdf"',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'PDF export failed' }, { status: 500 });
  }
}
