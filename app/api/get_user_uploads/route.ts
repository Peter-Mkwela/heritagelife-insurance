//api for Fetching all uploads
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust path to your Prisma client setup

export async function GET() {
  try {
    // Fetch all uploads including PolicyHolder details
    const uploads = await prisma.userUploads.findMany({
      include: {
        policyHolder: true, // Include related PolicyHolder details
      },
      orderBy: {
        id: 'desc', 
      },
    });

    // Return the uploads as a JSON response
    return NextResponse.json({ success: true, uploads });
  } catch (error) {
    console.error('Error fetching user uploads:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch uploads' }, { status: 500 });
  }
}
