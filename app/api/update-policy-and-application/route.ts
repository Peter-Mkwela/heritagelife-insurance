// app/api/update-policy-and-application/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const {
      policyId,
      ocrApplicationId,
      updatedPolicyData,
      updatedOcrApplicationData,
    } = await req.json();

    const updatedPolicy = await prisma.policy.update({
      where: { id: policyId },
      data: updatedPolicyData,
    });

    const updatedOcrApplication = await prisma.ocrApplication.update({
      where: { id: ocrApplicationId },
      data: updatedOcrApplicationData,
    });

    return NextResponse.json({ updatedPolicy, updatedOcrApplication });
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
