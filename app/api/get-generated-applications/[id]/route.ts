import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1]; // Extract dynamic [id] from the URL

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
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
