import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get('email') as string;
    const file = formData.get('file') as File;
    const agent_id = formData.get('agent_id') === 'null' ? null : Number(formData.get('agent_id'));

    if (!email || !file) {
      return NextResponse.json({ message: 'Email and file are required.' }, { status: 400 });
    }

    // Find the PolicyHolder by email
    let policyHolder = await prisma.policyHolder.findUnique({ where: { email } });

    if (!policyHolder) {
      return NextResponse.json({ message: 'Policyholder not found. Please register first.' }, { status: 404 });
    }

    // Update agent_id if it's different from the existing one and not null
    if (agent_id !== null && policyHolder.agent_id !== agent_id) {
      console.log(`Updating agent_id for ${email} from ${policyHolder.agent_id} to ${agent_id}`);
      await prisma.policyHolder.update({
        where: { id: policyHolder.id },
        data: { agent_id },
      });
    }

    // Save the file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, file.name);
    const fileBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(fileBuffer));

    // Save file info to UserUploads table
    const newUpload = await prisma.userUploads.create({
      data: {
        file_name: file.name,
        file_path: `/uploads/${file.name}`,
        policy_holder_id: policyHolder.id,
        status: 'Pending',
      },
    });

    return NextResponse.json({ message: 'File uploaded successfully!', upload: newUpload });
  } catch (err) {
    console.error('Error uploading file:', err);
    return NextResponse.json({ message: 'Failed to upload file.' }, { status: 500 });
  }
}
