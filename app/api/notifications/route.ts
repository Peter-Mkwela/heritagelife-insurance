import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    // Fetch notifications for the policyholder with the provided email
    const notifications = await prisma.notification.findMany({
      where: {
        policyHolder: {
          email: email, // Use email for querying notifications
        },
      },
      include: {
        policyHolder: true,
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
