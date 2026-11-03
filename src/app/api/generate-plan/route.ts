import { NextResponse } from 'next/server';
import { generateHousePlan } from '@/lib/ai/generatePlan';
import { wizardFormSchema } from '@/lib/schemas/wizardSchema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = wizardFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const formData = result.data;
    const apiKey = formData.apiKey || process.env.GEMINI_API_KEY;
    const plan = await generateHousePlan(formData, apiKey);
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
