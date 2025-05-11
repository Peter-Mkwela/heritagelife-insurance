import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: { id: true, full_name: true }, // Fetch only necessary fields
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ message: 'Failed to fetch agents' }, { status: 500 });
  }
}
