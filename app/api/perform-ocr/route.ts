import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileUrl, claimId } = body;

    if (!fileUrl || !claimId) {
      return NextResponse.json(
        { error: "fileUrl and claimId are required." },
        { status: 400 }
      );
    }

    const formData = new URLSearchParams();
    formData.append("url", fileUrl); // ✅ Send the remote file URL directly
    formData.append("apikey", "K89337592188957");
    formData.append("language", "eng");
    formData.append("OCREngine", "2");

    const ocrResponse = await axios.post(
      "https://api.ocr.space/parse/image",
      formData
    );

    if (ocrResponse.data.IsErroredOnProcessing) {
      return NextResponse.json(
        { error: "OCR failed", details: ocrResponse.data.ErrorMessage },
        { status: 400 }
      );
    }

    const extractedText = ocrResponse.data.ParsedResults[0].ParsedText;
    console.log("Extracted Text:", extractedText);

    // === Regex and data extraction logic here (same as before) ===

    const policyMatch = extractedText.match(/Policy Number:\s*([\S]+)/);
    const deceasedNameMatch = extractedText.match(/First name of Deceased:\s*([\s\S]+?)\nLast name of Deceased:/);
    const deceasedLastNameMatch = extractedText.match(/Last name of Deceased:\s*([\s\S]+?)\nCause of Death:/);
    let causeMatch = extractedText.match(/Cause of Death:\s*(.+)/);
    let DODMatch = extractedText.match(/Date of Death:\s*(\d{2}[\/\-|]\d{2}[\/\-|]\d{4})/);

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

    const policyNo = policyMatch ? policyMatch[1].trim() : null;
    const deceasedName = deceasedNameMatch ? deceasedNameMatch[1].trim().replace(/\n/g, ' ') : null;
    const deceasedLastName = deceasedLastNameMatch ? deceasedLastNameMatch[1].trim().replace(/\n/g, ' ') : null;
    const cause = causeMatch ? causeMatch[1].trim() : null;
    const DODString = DODMatch ? DODMatch[1].trim() : null;

    let DOD = null;
    if (DODString) {
      const standardizedDateString = DODString.replace(/[\/\-|]/g, '/');
      const [day, month, year] = standardizedDateString.split('/');
      const date = new Date(`${year}-${month}-${day}`);
      if (!isNaN(date.getTime())) {
        DOD = date.toISOString();
      } else {
        return NextResponse.json(
          { error: "Invalid Date of Death format." },
          { status: 400 }
        );
      }
    }

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
        filePath: fileUrl, // Save the UploadThing URL
      },
    });

    await prisma.claimFile.update({
      where: { id: claimId },
      data: { ocr_claim_id: newClaim.id, status: "Generated" },
    });

    return NextResponse.json({ success: true, id: newClaim.id }, { status: 201 });
  } catch (error) {
    console.error("OCR Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
