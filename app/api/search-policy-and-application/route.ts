// app/api/search-policy-and-application/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.trim();
  const policy_number = searchParams.get('policy_number')?.trim();

  try {
    // Require at least one field
    if (!email && !policy_number) {
      return NextResponse.json({ error: 'Please provide email or policy number.' }, { status: 400 });
    }

    // Dynamic filter logic
    const whereClause: any = {};
    if (email) whereClause.email = email;
    if (policy_number) whereClause.policy_number = policy_number;

    const policy = await prisma.policy.findFirst({
      where: whereClause,
      include: {
        policyHolder: true,
        agent: true,
      },
    });

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found.' }, { status: 404 });
    }

    const ocrApplication = await prisma.ocrApplication.findFirst({
      where: {
        fullName: policy.fullName,
      },
    });

    return NextResponse.json({ policy, application: ocrApplication });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
