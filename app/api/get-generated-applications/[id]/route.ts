// app/api/get-generated-applications/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // ✅ Required for Prisma + dynamic route

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const application = await prisma.ocrApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(application); // ✅ already correct
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
