import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, message } = await req.json();
    
    if (!email || !message) {
      return NextResponse.json({ message: 'Email or message is missing' }, { status: 400 });
    }

    // Store the query in the database
    const newQuery = await prisma.query.create({
      data: {
        message,
        senderEmail: email, // Use the email from the request
      },
    });

    // Fetch the policyholder based on the email
    const policyholder = await prisma.policyHolder.findUnique({
      where: { email },
    });

    if (policyholder!) {
      // Send a notification to the policyholder
     
      console.error('Policyholder not found with the provided email');
    }

    return NextResponse.json(newQuery);
  } catch (error) {
    return NextResponse.json({ message: 'Error sending the request' }, { status: 500 });
  }
}
