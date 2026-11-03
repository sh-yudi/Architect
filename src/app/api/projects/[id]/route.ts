import { NextResponse } from 'next/server';
import { getManualG5Plan } from '@/lib/ai/manualG5Plan';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // If the user requests the verified manual plan or any g5 project
  if (
    id === 'g5-verified-plan' ||
    id.includes('g5') ||
    id.includes('custom')
  ) {
    const plan = getManualG5Plan();
    return NextResponse.json({
      success: true,
      projectId: id,
      plan,
      formData: {
        plot: {
          width: 20,
          length: 45,
          shape: 'rectangular',
          facing: 'North',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
        },
        requirements: {
          floors: 6,
          bedrooms: 8,
          bathrooms: 8,
          hasLivingRoom: true,
          kitchenType: 'modular',
          parkingSpots: 2,
          hasPoojaRoom: false,
          hasServantQuarter: false,
          hasTerrace: true,
          hasBasement: false,
        },
        preferences: {
          style: 'Modern',
          garden: 'rear',
          balconies: 6,
          windowType: 'large',
        },
        budget: {
          range: '60-100L',
          qualityTier: 'luxury',
        },
        regulatory: {
          ownerName: 'Architect Client',
          fatherOrSpouseName: '',
          khasraNumber: '102/4',
          khatauniNumber: '55',
          authorityName: 'MCD / DDA',
          zone: 'Zone A',
        },
        customWishlist: plan.customWishlist,
      },
    });
  }

  // Fallback for any other project ID
  const defaultPlan = getManualG5Plan();
  return NextResponse.json({
    success: true,
    projectId: id,
    plan: defaultPlan,
  });
}
