// app/api/get-generated-applications/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid application ID." }, { status: 400 });
  }

  try {
    const application = await prisma.ocrApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
