import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all queries, both resolved and unresolved
    const queries = await prisma.query.findMany({
      orderBy: {
        created_at: 'desc', // Sort by creation date
      },
    });

    return NextResponse.json(queries); // Return all queries to the frontend
  } catch (error) {
    console.error('Error fetching queries:', error);
    return NextResponse.json(
      { message: 'Error fetching queries' },
      { status: 500 }
    );
  }
}
