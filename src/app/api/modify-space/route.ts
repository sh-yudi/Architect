import { NextResponse } from 'next/server';
import { modifySpace, ModifySpaceRequest } from '@/lib/ai/modifySpace';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan, floorLevel, roomId, prompt, directChanges, syncAllFloors, apiKey } = body;

    if (!plan || typeof floorLevel !== 'number' || !roomId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: plan, floorLevel, roomId' },
        { status: 400 }
      );
    }

    const key = apiKey || process.env.GEMINI_API_KEY;
    const result = await modifySpace(
      {
        plan,
        floorLevel,
        roomId,
        prompt,
        directChanges,
        syncAllFloors: syncAllFloors !== false, // default true for vertical alignment
      },
      key
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Modify Space API Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to modify space' },
      { status: 500 }
    );
  }
}
