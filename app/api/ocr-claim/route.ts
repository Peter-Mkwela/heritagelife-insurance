//app/api/ocr-claim
import { NextResponse } from "next/server";
import  prisma from "../../../lib/prisma"; // Ensure you have your Prisma instance imported

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const claimNo = `CL-${Math.floor(100000 + Math.random() * 900000)}`; // Unique Claim No

    const newClaim = await prisma.ocrClaim.create({
      data: {
        claimNo,
        policyNo: body.policyNo,
        deceasedName: body.deceasedName,
        deceasedLastName: body.deceasedLastName,
        cause: body.cause,
        DOD: new Date(body.DOD), // Ensure DateTime conversion
        filePath: body.filePath,
      },
    });

    return NextResponse.json(newClaim, { status: 201 });
  } catch (error) {
    console.error("Error inserting claim:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
