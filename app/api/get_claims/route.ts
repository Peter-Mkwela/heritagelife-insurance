//api for Fetching all claims
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const claims = await prisma.claimFile.findMany({
      select: {
        id: true,
        file_name: true,
        file_path: true,
        uploaded_at: true,
        policy_holder_id: true,
        status: true,
        ocr_claim_id: true,
        policy_number: true,
        policyHolder: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        //ocr_claim_id: 'asc', // Order by uploaded_at in descending order
        uploaded_at: 'desc',
      },
    });

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { message: 'Failed to fetch claims.' },
      { status: 500 }
    );
  }
}
