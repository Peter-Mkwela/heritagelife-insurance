//get-all-generated-applications api
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Ensure you have a prisma client setup

export async function GET() {
  try {
    const applications = await prisma.ocrApplication.findMany({});

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
