import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Adjust this import to your prisma path

export async function GET() {
  try {
    // Fetch all OcrClaims with the necessary fields, including created_at
    const claims = await prisma.ocrClaim.findMany({
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
      orderBy: {
        created_at: 'desc' 
      }
    });

    // Return the claims as JSON
    return NextResponse.json(claims);
  } catch (error) {
    console.error("ERROR: Unable to fetch claims", error);
    return NextResponse.json({ error: "Unable to fetch claims" }, { status: 500 });
  }
}
