// /app/api/upload_claim_thing/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, fileUrl, fileName } = await req.json();

    if (!email || !fileUrl || !fileName) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const policyHolder = await prisma.policyHolder.findUnique({ where: { email } });

    if (!policyHolder) {
      return NextResponse.json({ message: 'Policy holder not found.' }, { status: 404 });
    }

    const newClaim = await prisma.claimFile.create({
      data: {
        file_name: fileName,
        file_path: fileUrl,
        policy_holder_id: policyHolder.id,
        status: 'Pending',
      },
    });

    return NextResponse.json({ message: 'Claim submitted successfully!', claim: newClaim });
  } catch (err) {
    console.error('Error submitting claim:', err);
    return NextResponse.json({ message: 'Failed to submit claim.' }, { status: 500 });
  }
}
