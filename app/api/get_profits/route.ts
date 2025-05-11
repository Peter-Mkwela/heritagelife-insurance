import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // Fetch applications created within the specified year
    const applications = await prisma.ocrApplication.findMany({
      where: {
        created_at: {
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00Z`),
        },
      },
      select: {
        preferredPremium: true,
        created_at: true,
      },
    });

    // Fetch claims created within the specified year
    const claims = await prisma.ocrClaim.findMany({
      where: {
        created_at: {
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00Z`),
        },
      },
      select: {
        created_at: true,
      },
    });

    // Helper function to format month (e.g., "January 2025")
    const formatMonth = (date: Date) => {
      return date.toLocaleString("default", { month: "long", year: "numeric" });
    };

    // Initialize a map to store monthly profits
    const monthlyProfits: Record<string, { totalPremiums: number; totalClaims: number; netProfit: number }> = {};

    // Process application premiums
    applications.forEach((app) => {
      const monthKey = formatMonth(new Date(app.created_at));
      const premium = parseFloat(app.preferredPremium) || 0;

      if (!monthlyProfits[monthKey]) {
        monthlyProfits[monthKey] = { totalPremiums: 0, totalClaims: 0, netProfit: 0 };
      }
      monthlyProfits[monthKey].totalPremiums += premium;
    });

    // Process claims (Each claim is $100)
    claims.forEach((claim) => {
      const monthKey = formatMonth(new Date(claim.created_at));

      if (!monthlyProfits[monthKey]) {
        monthlyProfits[monthKey] = { totalPremiums: 0, totalClaims: 0, netProfit: 0 };
      }
      monthlyProfits[monthKey].totalClaims += 100;
    });

    // Calculate net profit for each month
    Object.keys(monthlyProfits).forEach((month) => {
      monthlyProfits[month].netProfit =
        monthlyProfits[month].totalPremiums - monthlyProfits[month].totalClaims;
    });

    // Convert object to an array for frontend compatibility
    const profitsArray = Object.entries(monthlyProfits).map(([month, values]) => ({
      policyType: month, // Month name
      totalPremiums: values.totalPremiums,
      totalClaims: values.totalClaims,
      netProfit: values.netProfit,
    }));

    return NextResponse.json({ profits: profitsArray }, { status: 200 });

  } catch (error) {
    console.error("ERROR: Fetching profits failed", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
