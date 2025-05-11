//get claim api from id
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const claim = await prisma.ocrClaim.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    return NextResponse.json(claim, { status: 200 });
  } catch (error) {
    console.error("ERROR: Fetching claim failed ->", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
