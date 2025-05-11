import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const agentId = req.nextUrl.searchParams.get('agent_id');
    if (!agentId) {
      return NextResponse.json({ message: 'Agent ID is required' }, { status: 400 });
    }

    const policyholders = await prisma.ocrApplication.findMany({
      where: {
        agent_id: parseInt(agentId),
      },
      select: {
        id: true,
        fullName: true,
        address: true,
        phone: true,
        preferredPremium: true,
        created_at: true,
      },
    });

    // Convert string premium to number
    const formatted = policyholders.map((p) => ({
      id: p.id,
      full_name: p.fullName,
      email: p.phone, // or add actual email if stored elsewhere
      premium: parseFloat(p.preferredPremium.replace(/,/g, '')),
      created_at: p.created_at,
    }));

    return NextResponse.json({ policyholders: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching policyholders' }, { status: 500 });
  }
}
