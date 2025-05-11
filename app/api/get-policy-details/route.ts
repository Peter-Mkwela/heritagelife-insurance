import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  try {
    const policyholder = await prisma.policyHolder.findUnique({
      where: { email },
      include: {
        policies: true,
        beneficiaries: true,
      },
    });

    if (!policyholder) {
      return NextResponse.json({ message: "Policyholder not found." }, { status: 404 });
    }

    return NextResponse.json({ policyholder });
  } catch (error) {
    console.error("Error fetching policy details:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
