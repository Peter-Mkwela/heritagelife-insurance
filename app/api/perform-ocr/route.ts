// app/api/claim-ocr/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "../../../lib/prisma";
import FormData from "form-data";

export async function POST(req: Request) {
  try {
    const { fileUrl, claimId } = await req.json();

    if (!fileUrl || !claimId) {
      return NextResponse.json(
        { error: "File URL and claimId are required." },
        { status: 400 }
      );
    }

    // Stream file from UploadThing URL
    const response = await axios.get(fileUrl, { responseType: "stream" });
    const contentType = response.headers['content-type'];

    const mimeToExt: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
    };

    const extension = mimeToExt[contentType];
    if (!extension) {
      return NextResponse.json({
        error: "Unsupported file type",
        details: [`Detected Content-Type: ${contentType}`, "Only PDF, JPG, and PNG are supported."],
      }, { status: 400 });
    }

    const finalFileName = `claim.${extension}`;

    const formData = new FormData();
    formData.append("file", response.data, { filename: finalFileName });
    formData.append("apikey", "K89337592188957");
    formData.append("language", "eng");
    formData.append("OCREngine", "2");

    const ocrResponse = await axios.post("https://api.ocr.space/parse/image", formData, {
      headers: { ...formData.getHeaders() },
    });

    if (ocrResponse.data.IsErroredOnProcessing) {
      return NextResponse.json(
        { error: "OCR failed", details: ocrResponse.data.ErrorMessage },
        { status: 400 }
      );
    }

    const extractedText = ocrResponse.data.ParsedResults[0].ParsedText;

    // Extract fields
    const policyMatch = extractedText.match(/Policy Number:\s*([\S]+)/);
    const deceasedNameMatch = extractedText.match(/First name of Deceased:\s*([\s\S]+?)\nLast name of Deceased:/);
    const deceasedLastNameMatch = extractedText.match(/Last name of Deceased:\s*([\s\S]+?)\nCause of Death:/);
    const causeMatch = extractedText.match(/Cause of Death:\s*(.+)/);
    const DODMatch = extractedText.match(/Date of Death:\s*(\d{2}[\/\-|]\d{2}[\/\-|]\d{4})/);

    const policyNo = policyMatch?.[1]?.trim() || null;
    const deceasedName = deceasedNameMatch?.[1]?.trim().replace(/\n/g, " ") || null;
    const deceasedLastName = deceasedLastNameMatch?.[1]?.trim().replace(/\n/g, " ") || null;
    const cause = causeMatch?.[1]?.trim() || null;

    let DOD: string | null = null;
    if (DODMatch?.[1]) {
      const parts = DODMatch[1].replace(/[|]/g, '/').split(/[\/\-]/);
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const parsed = new Date(`${year}-${month}-${day}`);
        if (!isNaN(parsed.getTime())) DOD = parsed.toISOString();
      }
    }

    if (!policyNo || !deceasedName || !deceasedLastName || !cause || !DOD) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          extractedFields: { policyNo, deceasedName, deceasedLastName, cause, DOD },
          extractedText,
        },
        { status: 400 }
      );
    }

    const claimNo = `CL-${Math.floor(100000 + Math.random() * 900000)}`;

    const newClaim = await prisma.ocrClaim.create({
      data: {
        claimNo,
        policyNo,
        deceasedName,
        deceasedLastName,
        cause,
        DOD,
        filePath: fileUrl,
      },
    });

    await prisma.claimFile.update({
      where: { id: claimId },
      data: { ocr_claim_id: newClaim.id, status: "Generated" },
    });

    return NextResponse.json(newClaim, { status: 201 });

  } catch (error) {
    console.error("Claim OCR API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
