// app/api/application-ocr/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "../../../lib/prisma";
import FormData from "form-data";
import path from "path";

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required." }, { status: 400 });
    }

    // Fetch the file from UploadThing URL as a stream
    const response = await axios.get(fileUrl, { responseType: "stream" });

    // Prepare form data for OCR.space API
    const formData = new FormData();
    formData.append("file", response.data, { filename: path.basename(fileUrl) });
    formData.append("apikey", "K89337592188957");
    formData.append("language", "eng");
    formData.append("OCREngine", "2");
    formData.append("isTable", "true");

    // Send to OCR.space
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

    // Extract fields using regex (adjust regex to your actual text format)
    const fields = {
      fullName: extractedText.match(/FullName:\s*([^\n]+)/i)?.[1]?.trim().replace(/[`_]/g, "'"),
      dob: extractedText.match(/Date of Birth:\s*([^\n(]+)/i)?.[1]?.trim(),
      address: extractedText.match(/Address:\s*([^\n]+)/i)?.[1]?.trim(),
      phone: extractedText.match(/Phone:\s*([^\n]+)/i)?.[1]?.trim(),
      medicalCondition: extractedText.match(/Medical Condition:\s*([^\n]+)/i)?.[1]?.trim(),
      preferredPremium: extractedText.match(/Preferred Premium:\s*([^\n]+)/i)?.[1]?.trim(),
    };

    // Parse DOB to ISO string if valid
    let dateOfBirth = null;
    if (fields.dob) {
      // You can adjust date parsing logic as needed
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
      preferredPremium: fields.preferredPremium,
    };

    // Check for missing required fields
    const missingFields = Object.entries(extractedFields)
      .filter(([_, value]) => !value)
      .map(([name]) => name);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", missingFields, extractedText, extractedFields },
        { status: 400 }
      );
    }

    // IMPORTANT: Here you must have some way to identify the UserUploads record linked to this fileUrl
    // For UploadThing URLs, you might want to store the UploadThing URL in your UserUploads.file_path field
    // So let's query by file_path matching fileUrl

    const userUpload = await prisma.userUploads.findFirst({
      where: { file_path: fileUrl, status: "Approved" },
      select: { policy_holder_id: true },
    });

    if (!userUpload || !userUpload.policy_holder_id) {
      return NextResponse.json(
        { error: "Policy Holder not found in UserUploads." },
        { status: 404 }
      );
    }

    // Get the agent_id from PolicyHolder
    const policyHolder = await prisma.policyHolder.findUnique({
      where: { id: userUpload.policy_holder_id },
      select: { agent_id: true },
    });

    const agentId = policyHolder?.agent_id || null;

    // Create applicationNo (random 6-digit number prefixed)
    const applicationNo = `APP-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create the OCR Application record
    const newApplication = await prisma.ocrApplication.create({
      data: {
        applicationNo,
        fullName: extractedFields.fullName!,
        dateOfBirth: extractedFields.dateOfBirth!,
        address: extractedFields.address!,
        phone: extractedFields.phone!,
        medicalCondition: extractedFields.medicalCondition!,
        preferredPremium: extractedFields.preferredPremium!,
        filePath: fileUrl,
        agent_id: agentId,
      },
    });

    // Update UserUploads status to "Generated"
    await prisma.userUploads.updateMany({
      where: { file_path: fileUrl, status: "Approved" },
      data: { status: "Generated" },
    });

    // Return the new application
    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error("OCR API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
