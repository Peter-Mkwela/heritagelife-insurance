import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, fileUrl, fileName, agent_id } = await req.json();

    if (!email || !fileUrl || !fileName) {
      return NextResponse.json({ message: 'Missing data.' }, { status: 400 });
    }

    const policyHolder = await prisma.policyHolder.findUnique({ where: { email } });

    if (!policyHolder) {
      return NextResponse.json({ message: 'Policyholder not found.' }, { status: 404 });
    }

    // Update agent_id if it's different
    if (agent_id !== 'null' && policyHolder.agent_id !== Number(agent_id)) {
      await prisma.policyHolder.update({
        where: { id: policyHolder.id },
        data: { agent_id: Number(agent_id) },
      });
    }

    // Save UploadThing file info to DB
    const newUpload = await prisma.userUploads.create({
      data: {
        file_name: fileName,
        file_path: fileUrl,
        policy_holder_id: policyHolder.id,
        status: 'Pending',
      },
    });

    return NextResponse.json({ message: 'Upload recorded successfully', upload: newUpload });
  } catch (err) {
    console.error('Upload Error:', err);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}
