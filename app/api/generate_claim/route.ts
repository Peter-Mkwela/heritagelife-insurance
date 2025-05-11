//api/generate_claim/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// Function to generate a claim number
const generateClaimNumber = async (): Promise<string> => {
  let claimNo = '';
  let isUnique = false;

  while (!isUnique) {
    const randomNumbers = Math.floor(100 + Math.random() * 900); // 3-digit number
    const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random uppercase letter
    claimNo = `C${randomNumbers}${randomLetter}`;

    const existingClaim = await prisma.ocrClaim.findUnique({
      where: { claimNo },
    });

    if (!existingClaim) {
      isUnique = true; // Exit loop if unique
    }
  }

  return claimNo; // Always returns a valid string
};

// Function to extract required values from OCR text
const extractDataFromOcr = (ocrText: string) => {
  const regexes = {
    policyNo: /Policy Number:\s*(\S+)/i,
    deceasedName: /First name of Deceased:\s*([\w\s]+)/i,
    deceasedLastName: /Last name of Deceased:\s*([\w\s]+)/i,
    cause: /Cause of Death:\s*([\w\s]+)/i,
    DOD: /Date of Death:\s*([\d-\/]+)/i, // Handles dates in formats like YYYY-MM-DD or DD/MM/YYYY
  };

  const extractedData = {
    policyNo: ocrText.match(regexes.policyNo)?.[1]?.trim() || '',
    deceasedName: ocrText.match(regexes.deceasedName)?.[1]?.trim() || '',
    deceasedLastName: ocrText.match(regexes.deceasedLastName)?.[1]?.trim() || '',
    cause: ocrText.match(regexes.cause)?.[1]?.trim() || '',
    DOD: ocrText.match(regexes.DOD)?.[1]?.trim() || '',
  };

  return extractedData;
};

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { ocrText, filePath } = req.body;

  if (!ocrText || !filePath) {
    return ({ message: 'OCR text and file path are required' });
  }

  try {
    // Extract values from OCR text
    const extractedData = extractDataFromOcr(ocrText);

    console.log('Extracted Data:', extractedData);  // Log the extracted data

    if (!extractedData.policyNo || !extractedData.deceasedName || !extractedData.deceasedLastName || !extractedData.cause || !extractedData.DOD) {
      console.error('Failed to extract all required claim details from OCR text');
      return res.status(400).json({ message: 'Failed to extract all required claim details from OCR text.' });
    }

    // Generate a unique claim number
    const claimNo = await generateClaimNumber();

    console.log('Generated Claim Number:', claimNo);  // Log the generated claim number

    // Ensure that the file path is correctly passed as a string
    const claimData = {
      claimNo,
      policyNo: extractedData.policyNo,
      deceasedName: extractedData.deceasedName,
      deceasedLastName: extractedData.deceasedLastName,
      cause: extractedData.cause,
      DOD: new Date(extractedData.DOD), // Ensure correct date format
      filePath: filePath as string, // Ensure filePath is passed as a string
    };

    console.log('Claim Data:', claimData);  // Log the claim data to be created

    // Create a new claim in the database
    const newClaim = await prisma.ocrClaim.create({
      data: claimData,
    });

    console.log('New Claim Created:', newClaim);  // Log the created claim

    return res.status(200).json({ message: 'Claim generated successfully', claim: newClaim });
  } catch (error) {
    console.error('Error generating claim:', error);
  }
}
