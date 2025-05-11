import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Fetch all OCR applications
    const ocrApplications = await prisma.ocrApplication.findMany({
      select: {
        preferredPremium: true,
        created_at: true,
      },
    });

    // Convert premiums from string to number and group them by month
    const monthlyPremiums: { [key: string]: number } = {};
    ocrApplications.forEach(app => {
      const month = new Date(app.created_at).toLocaleString('default', { month: 'long', year: 'numeric' });
      const premium = parseFloat(app.preferredPremium) || 0; // Convert string to number

      if (!monthlyPremiums[month]) {
        monthlyPremiums[month] = 0;
      }
      monthlyPremiums[month] += premium;
    });

    // Fetch all claims from OcrClaim
    const claims = await prisma.ocrClaim.findMany({
      select: {
        created_at: true,
      },
    });

    // Each claim costs $100, group them by month
    const monthlyClaims: { [key: string]: number } = {};
    claims.forEach(claim => {
      const month = new Date(claim.created_at).toLocaleString('default', { month: 'long', year: 'numeric' });

      if (!monthlyClaims[month]) {
        monthlyClaims[month] = 0;
      }
      monthlyClaims[month] += 100; // Each claim is $100
    });

    // Calculate profits (Premiums - Claims)
    const performance = Object.keys(monthlyPremiums).map(month => ({
      month,
      premiums: monthlyPremiums[month] || 0,
      claims: monthlyClaims[month] || 0,
      profit: (monthlyPremiums[month] || 0) - (monthlyClaims[month] || 0),
    }));

    return NextResponse.json({ performance }, { status: 200 });
  } catch (error) {
    
  }
}
