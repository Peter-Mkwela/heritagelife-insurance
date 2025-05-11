import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // You can use @ if path aliases are set, or use relative path

const generateClaimNumber = async (): Promise<string> => {
  let claimNo = '';
  let isUnique = false;

  while (!isUnique) {
    const randomNumbers = Math.floor(100 + Math.random() * 900);
    const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    claimNo = `C${randomNumbers}${randomLetter}`;

    const existingClaim = await prisma.ocrClaim.findUnique({
      where: { claimNo },
    });

    if (!existingClaim) {
      isUnique = true;
    }
  }

  return claimNo;
};

const extractDataFromOcr = (ocrText: string) => {
  const regexes = {
    policyNo: /Policy Number:\s*(\S+)/i,
    deceasedName: /First name of Deceased:\s*([\w\s]+)/i,
    deceasedLastName: /Last name of Deceased:\s*([\w\s]+)/i,
    cause: /Cause of Death:\s*([\w\s]+)/i,
    DOD: /Date of Death:\s*([\d-\/]+)/i,
  };

  return {
    policyNo: ocrText.match(regexes.policyNo)?.[1]?.trim() || '',
    deceasedName: ocrText.match(regexes.deceasedName)?.[1]?.trim() || '',
    deceasedLastName: ocrText.match(regexes.deceasedLastName)?.[1]?.trim() || '',
    cause: ocrText.match(regexes.cause)?.[1]?.trim() || '',
    DOD: ocrText.match(regexes.DOD)?.[1]?.trim() || '',
  };
};

// ✅ App Router-compliant POST method
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ocrText, filePath } = body;

    if (!ocrText || !filePath) {
      return NextResponse.json({ message: 'OCR text and file path are required' }, { status: 400 });
    }

    const extractedData = extractDataFromOcr(ocrText);

    if (
      !extractedData.policyNo ||
      !extractedData.deceasedName ||
      !extractedData.deceasedLastName ||
      !extractedData.cause ||
      !extractedData.DOD
    ) {
      return NextResponse.json({ message: 'Failed to extract all required claim details from OCR text.' }, { status: 400 });
    }

    const claimNo = await generateClaimNumber();

    const claimData = {
      claimNo,
      policyNo: extractedData.policyNo,
      deceasedName: extractedData.deceasedName,
      deceasedLastName: extractedData.deceasedLastName,
      cause: extractedData.cause,
      DOD: new Date(extractedData.DOD),
      filePath: filePath as string,
    };

    const newClaim = await prisma.ocrClaim.create({ data: claimData });

    return NextResponse.json({ message: 'Claim generated successfully', claim: newClaim }, { status: 200 });
  } catch (error) {
    console.error('Error generating claim:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
