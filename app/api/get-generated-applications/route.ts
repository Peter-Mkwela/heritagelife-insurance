//get-generated-applications api
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Ensure you have a prisma client setup

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Application ID is required." }, { status: 400 });
  }

  try {
    const application = await prisma.ocrApplication.findUnique({
      where: { id: parseInt(id) },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
