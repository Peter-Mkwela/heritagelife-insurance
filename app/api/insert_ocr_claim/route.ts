//insert_ocr_claim api

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json({ message: "File path is required" }, { status: 400 });
    }

    // Extract file extension
    const fileExtension = filePath.split(".").pop()?.toLowerCase();
    let fileType = "";

    if (fileExtension === "jpg" || fileExtension === "jpeg") fileType = "jpg";
    else if (fileExtension === "png") fileType = "png";
    else if (fileExtension === "pdf") fileType = "pdf";
    else {
      return NextResponse.json(
        { message: "Unsupported file type. Ensure the file has .jpg, .png, or .pdf extension." },
        { status: 400 }
      );
    }

    // Call OCR API with explicit filetype
    const formData = new FormData();
    formData.append("url", filePath); // File URL
    formData.append("apikey", "K89337592188957"); // Your OCR.space API key
    formData.append("language", "eng");
    formData.append("OCREngine", "2");
    formData.append("filetype", fileType); // Explicit file type

    const response = await axios.post("https://api.ocr.space/parse/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.IsErroredOnProcessing) {
      return NextResponse.json(
        { message: response.data.ErrorMessage || "OCR processing failed" },
        { status: 500 }
      );
    }

    const extractedText = response.data.ParsedResults[0].ParsedText;

    // Extract fields using regex or text parsing
    const policyNoMatch = extractedText.match(/Policy Number:\s*(\S+)/);
    const firstNameMatch = extractedText.match(/First name of Deceased:\s*(.+)/);
    const lastNameMatch = extractedText.match(/Last name of Deceased:\s*(.+)/);
    const causeMatch = extractedText.match(/Cause of Death:\s*(.+)/);
    const dodMatch = extractedText.match(/Date of Death:\s*(\d{4}-\d{2}-\d{2})/); // YYYY-MM-DD format

    const policyNo = policyNoMatch ? policyNoMatch[1] : "Unknown";
    const firstName = firstNameMatch ? firstNameMatch[1].trim() : "Unknown";
    const lastName = lastNameMatch ? lastNameMatch[1].trim() : "Unknown";
    const cause = causeMatch ? causeMatch[1].trim() : "Unknown";
    const dod = dodMatch ? new Date(dodMatch[1]) : new Date();

    // Ensure valid Date for DOD
    if (isNaN(dod.getTime())) {
      throw new Error("Invalid Date of Death format.");
    }

    // Generate a random claim number
    const claimNo = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;

    // Insert into OcrClaim table
    const newClaim = await prisma.ocrClaim.create({
      data: {
        claimNo,
        policyNo,
        deceasedName: firstName,
        deceasedLastName: lastName,
        cause,
        DOD: dod,
        filePath
      },
    });

    return NextResponse.json({ message: "Claim inserted successfully", claim: newClaim }, { status: 201 });
  } catch (error) {
    console.error("Error inserting claim:", error);
  }
}

