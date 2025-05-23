import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "../../../lib/prisma";
import fs from "fs";
import path from "path";
import FormData from "form-data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: "File path is required." }, { status: 400 });
    }

    const relativePath = fileUrl.replace(/^https?:\/\/localhost:3000/, "");
    const filePath = path.join(process.cwd(), "public", relativePath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `File not found at ${filePath}` }, { status: 404 });
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
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

    // Helper to extract specific fields
    const extractField = (label: string) => {
      const regex = new RegExp(`${label}:\\s*(.*)`, "i");
      const match = extractedText.match(regex);
      return match?.[1]?.trim() || null;
    };

    const fullName = extractField("FullName");
    const phone = extractField("Phone");
    const address = extractField("Adress|Address"); // to handle both spellings
    const medicalCondition = extractField("Medical Condition");
    const preferredPremium = extractField("Preferred Premium");
    const rawDOB = extractField("Date of Birth");

    let dateOfBirth: string | null = null;
    if (rawDOB) {
      const cleaned = rawDOB.replace(/[^\d-]/g, ""); // remove any text
      const [day, month, year] = cleaned.split("-");
      if (day && month && year) {
        const isoDate = new Date(`${year}-${month}-${day}`);
        if (!isNaN(isoDate.getTime())) {
          dateOfBirth = isoDate.toISOString();
        }
      }
    }

    const extractedFields = {
      fullName,
      dateOfBirth,
      address,
      phone,
      medicalCondition,
      preferredPremium
    };

    const missingFields = Object.entries(extractedFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", missingFields, extractedText, extractedFields },
        { status: 400 }
      );
    }

    // Step 1: Get policy_holder_id from UserUploads
    const userUpload = await prisma.userUploads.findFirst({
      where: { file_path: relativePath, status: "Approved" },
      select: { policy_holder_id: true },
    });

    if (!userUpload || !userUpload.policy_holder_id) {
      return NextResponse.json(
        { error: "Policy Holder not found in UserUploads." },
        { status: 404 }
      );
    }

    // Step 2: Get agent_id using policy_holder_id
    const policyHolder = await prisma.policyHolder.findUnique({
      where: { id: userUpload.policy_holder_id },
      select: { agent_id: true },
    });

    const agentId = policyHolder?.agent_id || null;

    // Step 3: Save the application
    const applicationNo = `APP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newApplication = await prisma.ocrApplication.create({
      data: {
        applicationNo,
        fullName: fullName!,
        dateOfBirth: dateOfBirth!,
        address: address!,
        phone: phone!,
        medicalCondition: medicalCondition!,
        preferredPremium: preferredPremium!,
        filePath: relativePath,
        agent_id: agentId,
      },
    });

    // Step 4: Mark the upload as Generated
    await prisma.userUploads.updateMany({
      where: { file_path: relativePath, status: "Approved" },
      data: { status: "Generated" },
    });

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error("OCR Processing Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
