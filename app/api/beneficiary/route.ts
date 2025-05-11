import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, policy_number, fullName, relationship, dateOfBirth } = await req.json();

    if (!email || !policy_number || !fullName || !relationship || !dateOfBirth) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const policyHolder = await prisma.policyHolder.findUnique({
      where: { email },
    });

    if (!policyHolder) {
      return NextResponse.json({ message: 'Policyholder not found.' }, { status: 404 });
    }

    const newBeneficiary = await prisma.beneficiary.create({
      data: {
        policyHolderId: policyHolder.id,
        policy_number,
        fullName,
        relationship,
        dateOfBirth: new Date(dateOfBirth),
        status: 'Pending',
      },
    });

    return NextResponse.json({ message: 'Beneficiary added successfully.', beneficiary: newBeneficiary });
  } catch (error) {
    console.error('Error adding beneficiary:', error);
    return NextResponse.json({ message: 'Failed to add beneficiary.' }, { status: 500 });
  }
}
