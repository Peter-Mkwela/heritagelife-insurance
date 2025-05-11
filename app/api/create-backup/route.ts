import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Count how many backups already exist
    const count = await prisma.backup.count();

    // Create the next backup name
    const backupName = `Backup${count + 1}`;
    const backupPath = `/backups/${backupName}.sql`; // You can customize this path

    // Save the new backup record
    const newBackup = await prisma.backup.create({
      data: {
        name: backupName,
        filePath: backupPath,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(newBackup, { status: 201 });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
