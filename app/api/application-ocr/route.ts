// app/api/application-ocr/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "../../../lib/prisma";
import FormData from "form-data";

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required." }, { status: 400 });
    }

    // Fetch file from UploadThing URL as a stream
    const response = await axios.get(fileUrl, { responseType: "stream" });
    const contentType = response.headers['content-type'];

    // Map MIME types to file extensions
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

    const finalFileName = `uploaded.${extension}`;

    // Prepare form data for OCR.space
    const formData = new FormData();
    formData.append("file", response.data, { filename: finalFileName });
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

    const fields = {
      fullName: extractedText.match(/FullName:\s*([^\n]+)/i)?.[1]?.trim().replace(/[`_]/g, "'"),
      dob: extractedText.match(/Date of Birth:\s*([^\n(]+)/i)?.[1]?.trim(),
      address: extractedText.match(/Ad(?:d)?ress:\s*([^\n]+)/i)?.[1]?.trim(),
      phone: extractedText.match(/Phone:\s*([^\n]+)/i)?.[1]?.trim(),
      medicalCondition: extractedText.match(/Medical Condition:\s*([^\n]+)/i)?.[1]?.trim(),
      preferredPremium: extractedText.match(/Preferred Premium:\s*([^\n]+)/i)?.[1]?.trim(),
    };

    // Parse DOB to ISO string if valid
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

    // Look up associated policy holder via file URL
    const baseUrl = fileUrl.split('?')[0];
    const userUpload = await prisma.userUploads.findFirst({
      where: { file_path: baseUrl, status: "Approved" },
    });
    

    if (!userUpload || !userUpload.policy_holder_id) {
      return NextResponse.json(
        { error: "Policy Holder not found in UserUploads." },
        { status: 404 }
      );
    }

    // Get the agent ID from the policy holder
    const policyHolder = await prisma.policyHolder.findUnique({
      where: { id: userUpload.policy_holder_id },
      select: { agent_id: true },
    });

    const agentId = policyHolder?.agent_id || null;
    const applicationNo = `APP-${Math.floor(100000 + Math.random() * 900000)}`;

    // Save OCR application
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

    await prisma.userUploads.updateMany({
      where: { file_path: fileUrl, status: "Approved" },
      data: { status: "Generated" },
    });

    return NextResponse.json(newApplication, { status: 201 });

  } catch (error) {
    console.error("OCR API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
