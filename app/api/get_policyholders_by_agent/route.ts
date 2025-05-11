import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const agentId = url.searchParams.get('agent_id');

  if (!agentId) {
    return NextResponse.json({ message: 'Agent ID is required' }, { status: 400 });
  }

  try {
    const applications = await prisma.ocrApplication.findMany({
      where: {
        agent_id: parseInt(agentId),
      },
      select: {
        id: true,
        fullName: true,
        address: true,
        phone: true,
        dateOfBirth: true,
        preferredPremium: true,
        created_at: true,
      },
    });

    return NextResponse.json({ policyholders: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ message: 'Error fetching policyholders' }, { status: 500 });
  }
}
