import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, policyNumber } = await req.json();

    // Ensure at least one field is provided
    const conditions = [];
    if (email) conditions.push({ email });
    if (policyNumber) conditions.push({ policy_number: policyNumber });

    if (conditions.length === 0) {
      return NextResponse.json({ error: 'Email or policy number is required.' }, { status: 400 });
    }

    // Fetch the policy record
    const policy = await prisma.policy.findFirst({
      where: {
        OR: conditions,
      },
    });

    if (!policy) {
      return NextResponse.json({ error: 'No matching policy found.' }, { status: 404 });
    }

    // Use the policy fullName to fetch the OCR application
    const ocrApplication = await prisma.ocrApplication.findFirst({
      where: {
        fullName: policy.fullName,
      },
    });

    if (!ocrApplication) {
      return NextResponse.json({ error: 'No matching application found for this policyholder.' }, { status: 404 });
    }

    return NextResponse.json({ policy, ocrApplication });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
