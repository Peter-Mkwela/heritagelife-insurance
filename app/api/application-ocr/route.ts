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

    // Enhanced regex patterns with better handling of variations
    const fields = {
      fullName: extractedText.match(/(?:FullName|Full Name)[:\s-]*([^\n\r]+)/i)?.[1]?.trim().replace(/[`_]/g, "'"),
      dob: extractedText.match(/(?:Date of Birth|DOB|D\.O\.B)[:\s-]*([^\n\r(]+)/i)?.[1]?.trim(),
      address: extractedText.match(/(?:Adress|Address)[:\s-]*([^\n\r]+)/i)?.[1]?.trim(),
      phone: extractedText.match(/(?:Phone|Phone Number|Tel)[:\s-]*([^\n\r]+)/i)?.[1]?.trim(),
      medicalCondition: extractedText.match(/(?:Medical Condition|Condition|Health Status)[:\s-]*([^\n\r]+)/i)?.[1]?.trim(),
      preferredPremium: extractedText.match(/(?:Preferred Premium|Premium|Payment)[:\s-]*([^\n\r]+)/i)?.[1]?.trim()
    };

    // Improved date parsing with more flexible formats
    let dateOfBirth = null;
    if (fields.dob) {
      // Clean the date string - handle various separators and formats
      const cleanDOB = fields.dob.replace(/[^\d\-\/\.\s]/g, '')
                                 .replace(/\s+/g, '-') // replace spaces with -
                                 .replace(/\/+/g, '-') // replace / with -
                                 .replace(/\.+/g, '-'); // replace . with -
      
      // Try different date formats
      const formats = [
        /(\d{1,2})-(\d{1,2})-(\d{2,4})/, // DD-MM-YYYY or DD-MM-YY
        /(\d{1,2})\s(\d{1,2})\s(\d{2,4})/, // DD MM YYYY
        /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/ // DD/MM/YYYY
      ];
      
      let day, month, year;
      for (const format of formats) {
        const match = cleanDOB.match(format);
        if (match) {
          day = match[1].padStart(2, '0');
          month = match[2].padStart(2, '0');
          year = match[3].length === 2 ? `20${match[3]}` : match[3];
          break;
        }
      }
      
      if (day && month && year) {
        const dateObj = new Date(`${year}-${month}-${day}`);
        if (!isNaN(dateObj.getTime())) {
          dateOfBirth = dateObj.toISOString();
        }
      }
    }

    // Clean phone numbers
    if (fields.phone) {
      fields.phone = fields.phone.replace(/[^\d]/g, ''); // Remove all non-digit characters
    }

    // Clean premium amount
    if (fields.preferredPremium) {
      fields.preferredPremium = fields.preferredPremium.replace(/[^\d]/g, ''); // Extract only numbers
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
        { 
          error: "Missing required fields", 
          missingFields, 
          extractedText, 
          extractedFields,
          suggestions: "Consider improving image quality or verifying field labels in the form."
        },
        { status: 400 }
      );
    }

    // Rest of your database logic remains the same...
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

    const policyHolder = await prisma.policyHolder.findUnique({
      where: { id: userUpload.policy_holder_id },
      select: { agent_id: true },
    });

    const agentId = policyHolder?.agent_id || null;

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

    await prisma.userUploads.updateMany({
      where: { file_path: relativePath, status: "Approved" },
      data: { status: "Generated" },
    });

    return NextResponse.json(newApplication, { status: 201 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}