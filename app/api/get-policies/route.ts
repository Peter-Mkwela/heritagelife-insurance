import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const policyHolder = await prisma.policyHolder.findUnique({
      where: { email },
      include: { uploads: true },
    });

    if (!policyHolder || policyHolder.uploads.length === 0) {
      return NextResponse.json({ policies: [] });
    }

    // Extract non-null and unique policy numbers
    const policyNumbers = Array.from(
      new Set(
        policyHolder.uploads
          .map(upload => upload.policy_number)
          .filter((p): p is string => !!p) // Remove null/undefined
      )
    );

    return NextResponse.json({ policies: policyNumbers });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json({ message: 'Failed to fetch policies.' }, { status: 500 });
  }
}
