import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server'; // Importing NextRequest for proper typing
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) { // Typing req explicitly as NextRequest
  const { id, action, email } = await req.json(); // Use await to parse JSON body

  if (!id || !action || !email) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Find the claim based on the ID
    const claim = await prisma.claimFile.findUnique({
      where: { id },
      include: {
        policyHolder: true,  // Include related policyholder data
      },
    });

    if (!claim) {
      return NextResponse.json({ message: 'Claim not found' }, { status: 404 });
    }

    // Perform action on the claim (approve or reject)
    let updatedClaim;
    let message = '';
    if (action === 'approve') {
      updatedClaim = await prisma.claimFile.update({
        where: { id },
        data: { status: 'Approved' },
      });
      message = 'Approval successful';
    } else if (action === 'reject') {
      updatedClaim = await prisma.claimFile.update({
        where: { id },
        data: { status: 'Rejected' },
      });
      message = 'Rejected';
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    // Create a notification in the system
    await prisma.notification.create({
      data: {
        policyHolderId: claim.policyHolder.id,
        message: `${message} - Your claim has been ${action}ed.`,
        email: email, // Add email to the notification creation
      },
    });

    return NextResponse.json({ message });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred while updating the claim.' }, { status: 500 });
  }
}
