import { NextResponse } from 'next/server';
import { generatePlanDXF } from '@/lib/export/dxfWriter';
import { HousePlan } from '@/types/plan';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.plan) {
      return NextResponse.json({ error: 'Missing plan payload' }, { status: 400 });
    }
    const { plan } = body as { plan: HousePlan };
    const dxf = generatePlanDXF(plan);

    return new Response(dxf, {
      headers: {
        'Content-Type': 'application/dxf',
        'Content-Disposition': 'attachment; filename="upobpas-building-plan.dxf"',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'DXF export failed' }, { status: 500 });
  }
}
