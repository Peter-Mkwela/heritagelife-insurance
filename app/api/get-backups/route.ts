// app/api/backup/list/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ backups });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch backups' }, { status: 500 });
  }
}
