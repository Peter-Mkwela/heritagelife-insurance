// api/fetch_notifications.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email'); // Get email from query parameters

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Query notifications based on the email
    const notifications = await prisma.notification.findMany({
      where: {
        policyHolder: {
          email,
        },
      },
      include: {
        policyHolder: true, // Include related policyholder data
      },
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
