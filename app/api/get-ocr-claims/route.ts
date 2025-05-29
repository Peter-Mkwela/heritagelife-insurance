// app/api/get-ocr-claims/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");

  if (!idParam) {
    return NextResponse.json({ error: "ID query parameter is required." }, { status: 400 });
  }

  const claimId = parseInt(idParam);
  if (isNaN(claimId)) {
    return NextResponse.json({ error: "Invalid claim ID" }, { status: 400 });
  }

  try {
    const claim = await prisma.ocrClaim.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        claimNo: true,
        policyNo: true,
        deceasedName: true,
        deceasedLastName: true,
        cause: true,
        DOD: true,
        created_at: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    return NextResponse.json(claim);
  } catch (error) {
    console.error("ERROR: Unable to fetch claim", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
