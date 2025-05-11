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

    const extractedText = ocrResponse.data.ParsedResults[0].ParsedText;

    const fields = {
      fullName: extractedText.match(/FullName:\s*([^\n]+)/i)?.[1]?.trim().replace(/[`_]/g, "'"),
      dob: extractedText.match(/Date of Birth:\s*([^\n(]+)/i)?.[1]?.trim(),
      address: extractedText.match(/Adress:\s*([^\n]+)/i)?.[1]?.trim(),
      phone: extractedText.match(/Phone:\s*([^\n]+)/i)?.[1]?.trim(),
      medicalCondition: extractedText.match(/Medical Condition:\s*([^\n]+)/i)?.[1]?.trim(),
      preferredPremium: extractedText.match(/Preferred Premium:\s*([^\n]+)/i)?.[1]?.trim()
    };

    let dateOfBirth = null;
    if (fields.dob) {
      const cleanDOB = fields.dob.replace(/[^\d-]/g, '');
      const [day, month, year] = cleanDOB.split('-');
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
      preferredPremium: fields.preferredPremium
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

    // Step 1: Fetch the policy_holder_id from the UserUploads table
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

    // Step 2: Fetch the agent_id from the PolicyHolder table using policy_holder_id
    const policyHolder = await prisma.policyHolder.findUnique({
      where: { id: userUpload.policy_holder_id },
      select: { agent_id: true },
    });

    const agentId = policyHolder?.agent_id || null;

    // Step 3: Create the new OCR Application with agent_id
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
        agent_id: agentId, // Associate the agent with the application
      },
    });

    // Update the UserUploads status to "Generated" after OCR processing
    await prisma.userUploads.updateMany({
      where: { file_path: relativePath, status: "Approved" },
      data: { status: "Generated" },
    });

    return NextResponse.json(newApplication, { status: 201 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
