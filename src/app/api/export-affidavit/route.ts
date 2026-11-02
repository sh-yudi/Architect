import { NextResponse } from 'next/server';
import { generateIndemnityAffidavitPDF } from '@/lib/export/affidavitPdf';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.plan || !body.formData) {
      return NextResponse.json({ error: 'Missing plan or formData payload' }, { status: 400 });
    }
    const { plan, formData } = body as { plan: HousePlan; formData: WizardFormData };
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
