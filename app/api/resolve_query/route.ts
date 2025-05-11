import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { id, email } = await req.json();

    // Ensure both query ID and email are provided
    if (!id || !email) {
      return NextResponse.json({ message: 'Query ID and email are required' }, { status: 400 });
    }

    // Mark the query as resolved
    const query = await prisma.query.update({
      where: { id },
      data: { resolved: true }, // Ensure resolved field is properly defined in your schema
    });

    if (!query) {
      return NextResponse.json({ message: 'Query not found' }, { status: 404 });
    }

    // Find the policyholder by email
    const policyHolder = await prisma.policyHolder.findUnique({
      where: { email },
    });

    if (!policyHolder) {
      return NextResponse.json({ message: 'Policyholder not found' }, { status: 404 });
    }

    // Send a notification to the policyholder
    await prisma.notification.create({
      data: {
        policyHolderId: policyHolder.id, // Non-undefined value
        message: 'Your query has been resolved by the system administrator.',
        email: policyHolder.email, // Email of the policyholder
      },
    });

    return NextResponse.json({ message: 'Query resolved successfully' });
  } catch (error) {
    console.error('Error resolving query:', error);
    return NextResponse.json({ message: 'Error resolving query' }, { status: 500 });
  }
}
