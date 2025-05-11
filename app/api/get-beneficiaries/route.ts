// api/get-beneficiaries/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const beneficiaries = await prisma.beneficiary.findMany({
      include: {
        policyHolder: true, // Include policyholder details
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ beneficiaries });
  } catch (error) {
    console.error("Failed to fetch beneficiaries:", error);
    return NextResponse.json({ error: 'Failed to fetch beneficiaries' }, { status: 500 });
  }
}
