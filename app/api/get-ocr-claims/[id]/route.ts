import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This gets the dynamic `id` from the URL
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const claimId = parseInt(params.id);
    if (isNaN(claimId)) {
      return NextResponse.json({ error: 'Invalid claim ID' }, { status: 400 });
    }

    // Fetch the specific claim by ID
    const claim = await prisma.ocrClaim.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        claimNo: true,
        policyNo: true,
        deceasedName: true,
        deceasedLastName: true,
        cause: true,
        DOD: true,
        created_at: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    return NextResponse.json(claim);
  } catch (error) {
    console.error("ERROR: Unable to fetch claim", error);
    return NextResponse.json({ error: "Unable to fetch claim" }, { status: 500 });
  }
}
