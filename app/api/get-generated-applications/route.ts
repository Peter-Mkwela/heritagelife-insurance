// app/api/get-generated-applications/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");

  if (!idParam) {
    return NextResponse.json({ error: "ID query parameter is required." }, { status: 400 });
  }

  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const application = await prisma.ocrApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
