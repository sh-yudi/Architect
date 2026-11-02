import { NextResponse } from 'next/server';
import { generatePlanDXF } from '@/lib/export/dxfWriter';
import { HousePlan } from '@/types/plan';

export async function POST(req: Request) {
  try {
    const { plan } = (await req.json()) as { plan: HousePlan };
    if (!plan) {
      return NextResponse.json({ error: 'DXF export failed' }, { status: 500 });
    }
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
