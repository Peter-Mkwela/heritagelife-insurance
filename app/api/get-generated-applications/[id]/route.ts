import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const parsedId = parseInt(id);

  if (isNaN(parsedId)) {
    return NextResponse.json({ error: "Invalid application ID." }, { status: 400 });
  }

  try {
    const application = await prisma.ocrApplication.findUnique({
      where: { id: parsedId },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
