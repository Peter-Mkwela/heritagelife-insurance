import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  try {
    const policyHolder = await prisma.policyHolder.findUnique({
      where: { email },
    });

    if (!policyHolder) {
      return NextResponse.json({ policyNumbers: [] });
    }

    const policies = await prisma.policy.findMany({
      where: { policy_holder_id: policyHolder.id },
      select: { policy_number: true },
    });

    const policyNumbers = policies.map(p => p.policy_number);
    return NextResponse.json({ policyNumbers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch policy numbers.' }, { status: 500 });
  }
}
