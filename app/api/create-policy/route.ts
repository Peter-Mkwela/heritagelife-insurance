import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // adjust based on your project structure

export async function POST(req: Request) {
  try {
    const { userUploadId } = await req.json();

    if (!userUploadId) {
      return NextResponse.json({ error: 'Missing userUploadId' }, { status: 400 });
    }

    // Get the UserUploads entry
    const upload = await prisma.userUploads.findUnique({
      where: { id: userUploadId },
      include: {
        policyHolder: true,
      },
    });

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    if (!upload.ocr_application_id) {
      return NextResponse.json({ error: 'OCR Application not linked' }, { status: 400 });
    }

    // Fetch the OCR application
    const ocrApp = await prisma.ocrApplication.findUnique({
      where: { id: upload.ocr_application_id },
    });

    if (!ocrApp) {
      return NextResponse.json({ error: 'OCR Application not found' }, { status: 404 });
    }

    // Create a new Policy record
    const newPolicy = await prisma.policy.create({
      data: {
        policy_number: upload.policy_number || '', // fallback in case it's not set
        policy_holder_id: upload.policy_holder_id,
        agent_id: ocrApp.agent_id || null,
        fullName: ocrApp.fullName,
        email: upload.policyHolder.email,
        dateOfBirth: ocrApp.dateOfBirth,
        phone: ocrApp.phone,
      },
    });

    return NextResponse.json({ message: 'Policy created successfully', policy: newPolicy }, { status: 201 });

  } catch (error) {
    console.error('Error creating policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
