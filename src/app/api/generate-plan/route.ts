import { NextResponse } from 'next/server';
import { generateHousePlan } from '@/lib/ai/generatePlan';
import { WizardFormData } from '@/types/wizard';

export async function POST(req: Request) {
  try {
    const formData = (await req.json()) as WizardFormData;
    const plan = await generateHousePlan(formData);
    const projectId = `proj_${Date.now()}`;

    return NextResponse.json({
      success: true,
      projectId,
      plan,
    });
  } catch (error) {
    console.error('API Plan Gen Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate plan' },
      { status: 500 }
    );
  }
}
