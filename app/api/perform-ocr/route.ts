// API for performing OCR
import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "../../../lib/prisma";
import fs from "fs";
import path from "path";
import FormData from "form-data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileUrl, claimId } = body; // Ensure claimId is extracted

    if (!fileUrl || !claimId) {
      return NextResponse.json(
        { error: "File path and claimId are required." },
        { status: 400 }
      );
    }

    // Extract relative path from URL
    const relativePath = fileUrl.replace(/^https?:\/\/localhost:3000/, "");
    const filePath = path.join(process.cwd(), "public", relativePath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File not found at ${filePath}` },
        { status: 404 }
      );
    }

    // Prepare FormData for OCR API
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("apikey", "K89337592188957");
    formData.append("language", "eng");
    formData.append("OCREngine", "2");

    // Send request to OCR.space
    const ocrResponse = await axios.post(
      "https://api.ocr.space/parse/image",
      formData,
      {
        headers: { ...formData.getHeaders() },
      }
    );

    if (ocrResponse.data.IsErroredOnProcessing) {
      return NextResponse.json(
        { error: "OCR failed", details: ocrResponse.data.ErrorMessage },
        { status: 400 }
      );
    }

    const extractedText = ocrResponse.data.ParsedResults[0].ParsedText;
    console.log("Extracted Text:", extractedText);

    // Extract data using regex
    const policyMatch = extractedText.match(/Policy Number:\s*([\S]+)/);
    const deceasedNameMatch = extractedText.match(/First name of Deceased:\s*([\s\S]+?)\nLast name of Deceased:/);
    const deceasedLastNameMatch = extractedText.match(/Last name of Deceased:\s*([\s\S]+?)\nCause of Death:/);
    let causeMatch = extractedText.match(/Cause of Death:\s*(.+)/);
    let DODMatch = extractedText.match(/Date of Death:\s*(\d{2}[\/\-|]\d{2}[\/\-|]\d{4})/);

    // Fallback for cause/DOD if regex fails due to OCR formatting
    const lines = extractedText.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);

    if (!causeMatch) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes("cause of death")) {
          const next = lines[i + 1] || "";
          if (next && !next.toLowerCase().includes("date of death")) {
            causeMatch = [, next];
            break;
          }
        }
      }
    }

    if (!DODMatch) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes("date of death")) {
          const next = lines[i + 1] || "";
          const dateMatch = next.match(/(\d{2})[\/\-|](\d{2})[\/\-|](\d{4})/);
          if (dateMatch) {
            DODMatch = [, dateMatch[0]];
            break;
          }
        }
      }
    }

    // Log regex matches for debugging
    console.log("Policy Number Match:", policyMatch);
    console.log("First Name Match:", deceasedNameMatch);
    console.log("Last Name Match:", deceasedLastNameMatch);
    console.log("Cause of Death Match:", causeMatch);
    console.log("Date of Death Match:", DODMatch);

    // Extract values
    const policyNo = policyMatch ? policyMatch[1].trim() : null;
    const deceasedName = deceasedNameMatch ? deceasedNameMatch[1].trim().replace(/\n/g, ' ') : null;
    const deceasedLastName = deceasedLastNameMatch ? deceasedLastNameMatch[1].trim().replace(/\n/g, ' ') : null;
    const cause = causeMatch ? causeMatch[1].trim() : null;
    const DODString = DODMatch ? DODMatch[1].trim() : null;

    // Standardize the Date of Death format
    let DOD = null;
    if (DODString) {
      const standardizedDateString = DODString.replace(/[\/\-|]/g, '/');
      const [day, month, year] = standardizedDateString.split('/');
      const date = new Date(`${year}-${month}-${day}`);
      if (!isNaN(date.getTime())) {
        DOD = date.toISOString();
      } else {
        console.error("Invalid Date of Death:", DODString);
        return NextResponse.json(
          { error: "Invalid Date of Death format." },
          { status: 400 }
        );
      }
    }

    // Final extracted values
    console.log("Policy Number:", policyNo);
    console.log("First Name:", deceasedName);
    console.log("Last Name:", deceasedLastName);
    console.log("Cause of Death:", cause);
    console.log("Standardized Date of Death:", DOD);

    if (!policyNo || !deceasedName || !deceasedLastName || !cause || !DOD) {
      return NextResponse.json(
        { error: "Unable to extract necessary fields." },
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
        filePath: relativePath,
      },
    });

    console.log("SUCCESS: Claim stored in DB ->", newClaim);

    await prisma.claimFile.update({
      where: { id: claimId },
      data: { ocr_claim_id: newClaim.id, status: "Generated" },
    });

    console.log("SUCCESS: ClaimFile updated with OCR claim ID");

    return NextResponse.json({ success: true, id: newClaim.id }, { status: 201 });
  } catch (error) {
    console.error("ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
