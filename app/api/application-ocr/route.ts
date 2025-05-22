import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "../../../lib/prisma";
import FormData from "form-data";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required." }, { status: 400 });
    }

    // Fetch file as Buffer from URL
    const fileResponse = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const fileBuffer = Buffer.from(fileResponse.data, "binary");

    // Determine file extension and content type
    const ext = path.extname(fileUrl).toLowerCase().replace(".", "");
    const allowedTypes: Record<string, string> = {
      pdf: "application/pdf",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
    };

    const contentType = allowedTypes[ext];

    if (!contentType) {
      return NextResponse.json(
        { error: "Unsupported file type. Only PDF, PNG, JPG, and JPEG are allowed." },
        { status: 400 }
      );
    }

    // Prepare form data for OCR.space
    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: `upload.${ext}`,
      contentType: contentType,
    });
    formData.append("apikey", "K89337592188957");
    formData.append("language", "eng");
    formData.append("OCREngine", "2");
    formData.append("isTable", "true");

    const ocrResponse = await axios.post("https://api.ocr.space/parse/image", formData, {
      headers: { ...formData.getHeaders() },
    });

    if (ocrResponse.data.IsErroredOnProcessing) {
      return NextResponse.json(
        { error: "OCR failed", details: ocrResponse.data.ErrorMessage },
        { status: 400 }
      );
    }

    const extractedText = ocrResponse.data.ParsedResults?.[0]?.ParsedText || "";

    const fields = {
      fullName: extractedText.match(/FullName:\s*([^\n]+)/i)?.[1]?.trim().replace(/[`_]/g, "'"),
      dob: extractedText.match(/Date of Birth:\s*([^\n(]+)/i)?.[1]?.trim(),
      address: extractedText.match(/Adress:\s*([^\n]+)/i)?.[1]?.trim(),
      phone: extractedText.match(/Phone:\s*([^\n]+)/i)?.[1]?.trim(),
      medicalCondition: extractedText.match(/Medical Condition:\s*([^\n]+)/i)?.[1]?.trim(),
      preferredPremium: extractedText.match(/Preferred Premium:\s*([^\n]+)/i)?.[1]?.trim(),
    };

    // Format and validate DOB
    let dateOfBirth = null;
    if (fields.dob) {
      const cleanDOB = fields.dob.replace(/[^\d-]/g, "");
      const [day, month, year] = cleanDOB.split("-");
      if (day && month && year) {
        const dateObj = new Date(`${year}-${month}-${day}`);
        if (!isNaN(dateObj.getTime())) {
          dateOfBirth = dateObj.toISOString();
        }
      }
    }

    const extractedFields = {
      fullName: fields.fullName,
      dateOfBirth,
      address: fields.address,
      phone: fields.phone,
      medicalCondition: fields.medicalCondition,
      preferredPremium: fields.preferredPremium,
    };

    const missingFields = Object.entries(extractedFields)
      .filter(([_, value]) => !value)
      .map(([name]) => name);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", missingFields, extractedText, extractedFields },
        { status: 400 }
      );
    }

    // Extract relative path from fileUrl
    const relativePath = fileUrl.replace(/^https?:\/\/localhost:3000/, "");

    // Step 1: Get policy_holder_id from userUploads
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

    // Step 2: Get agent_id from policyHolder table
    const policyHolder = await prisma.policyHolder.findUnique({
      where: { id: userUpload.policy_holder_id },
      select: { agent_id: true },
    });

    const agentId = policyHolder?.agent_id || null;

    // Step 3: Create OCR application
    const applicationNo = `APP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newApplication = await prisma.ocrApplication.create({
      data: {
        applicationNo,
        fullName: extractedFields.fullName!,
        dateOfBirth: extractedFields.dateOfBirth!,
        address: extractedFields.address!,
        phone: extractedFields.phone!,
        medicalCondition: extractedFields.medicalCondition!,
        preferredPremium: extractedFields.preferredPremium!,
        filePath: relativePath,
        agent_id: agentId,
      },
    });

    // Step 4: Mark file as "Generated"
    await prisma.userUploads.updateMany({
      where: { file_path: relativePath, status: "Approved" },
      data: { status: "Generated" },
    });

    return NextResponse.json(newApplication, { status: 201 });

  } catch (error) {
    console.error("OCR API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
