import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const appId = parseInt(params.id);
    if (isNaN(appId)) {
      return NextResponse.json({ error: "Invalid application ID." }, { status: 400 });
    }

    const application = await prisma.ocrApplication.findUnique({
      where: { id: appId },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
