import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function generatePolicyNumber(): string {
  const randomNum = Math.floor(Math.random() * 900) + 100;
  const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `P${randomNum}${randomLetter}`;
}

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json();

    const upload = await prisma.userUploads.findUnique({
      where: { id },
      include: { policyHolder: true },
    });

    if (!upload) {
      return NextResponse.json({ success: false, message: 'Upload not found' }, { status: 404 });
    }

    if (action === 'approve') {
      const policyNumber = generatePolicyNumber();

      // Update status and assign policy number
      await prisma.userUploads.update({
        where: { id },
        data: { status: 'Approved', policy_number: policyNumber },
      });

      // Create a notification for the policyholder
      await prisma.notification.create({
        data: {
          policyHolderId: upload.policyHolder.id,
          email: upload.policyHolder.email,
          message: `Your application was approved on ${new Date().toLocaleDateString()}! Your policy number is: ${policyNumber}`,
        },
      });

      // Include the policy number in the response
      return NextResponse.json({
        success: true,
        message: 'Policy approved',
        policy_number: policyNumber,
      });
    }

    if (action === 'reject') {
      // Update status to "Rejected"
      await prisma.userUploads.update({
        where: { id },
        data: { status: 'Rejected' },
      });

      // Create a notification for the policyholder
      await prisma.notification.create({
        data: {
          policyHolderId: upload.policyHolder.id,
          email: upload.policyHolder.email,
          message: `Your application was rejected on ${new Date().toLocaleDateString()}. Please contact support for further details.`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Policy rejected',
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating upload:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
