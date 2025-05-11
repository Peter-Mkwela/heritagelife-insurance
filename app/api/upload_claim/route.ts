//api upload claim
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma'; // Adjust to your Prisma client path

export async function POST(req: Request) {
  try {
    // Parse form data
    const formData = await req.formData();
    const email = formData.get('email') as string;
    const file = formData.get('file') as File;

    if (!email || !file) {
      return NextResponse.json({ message: 'Email and file are required.' }, { status: 400 });
    }

    // Find the PolicyHolder by email
    const policyHolder = await prisma.policyHolder.findUnique({
      where: { email },
    });

    if (!policyHolder) {
      return NextResponse.json({ message: 'Policy holder not found.' }, { status: 404 });
    }

    // Ensure the uploads directory exists in the public folder
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Save the file locally in public/uploads
    const filePath = path.join(uploadDir, file.name);
    const fileBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(fileBuffer));

    // Save the file information to the ClaimFile table
    const newClaim = await prisma.claimFile.create({
      data: {
        file_name: file.name,
        file_path: `/uploads/${file.name}`, // This will be accessible via the URL
        policy_holder_id: policyHolder.id,
        status: 'Pending', // Default status
      },
    });

    return NextResponse.json({ message: 'Claim submitted successfully!', claim: newClaim });
  } catch (err) {
    console.error('Error submitting claim:', err);
    return NextResponse.json({ message: 'Failed to submit claim.' }, { status: 500 });
  }
}
