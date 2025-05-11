// pages/api/update-application-id
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ocrApplicationId, action } = body;

    console.log("🚀 Received update request:");
    console.log("ID:", id);
    console.log("OCR Application ID:", ocrApplicationId);
    console.log("Action:", action);

    if (!id || !ocrApplicationId) {
      console.error("❌ ERROR: Missing ID or OCR Application ID");
      return NextResponse.json({ error: "Missing ID or OCR Application ID" }, { status: 400 });
    }

    // Check if userUploads record exists
    const existingUpload = await prisma.userUploads.findUnique({
      where: { id },
    });

    console.log("📂 Existing Upload Record:", existingUpload);

    if (!existingUpload) {
      console.error("❌ ERROR: User upload not found");
      return NextResponse.json({ error: "User upload not found" }, { status: 404 });
    }

    // Update the userUploads table with the ocr_application_id
    const updatedUpload = await prisma.userUploads.update({
      where: { id },
      data: {
        ocr_application_id: ocrApplicationId,
        status: "Generated",
      },
    });

    console.log("✅ SUCCESS: User upload updated:", updatedUpload);

    return NextResponse.json({ message: "User upload updated successfully", updatedUpload }, { status: 200 });
  } catch (error) {
    console.error("❌ ERROR: Internal Server Error ->", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

