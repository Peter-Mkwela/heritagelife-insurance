import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days")) || 30; // Default to 30 days

    // Calculate the date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch applications created within the specified days
    const newBusiness = await prisma.ocrApplication.findMany({
      where: {
        created_at: {
          gte: startDate,
        },
      },
      select: {
        applicationNo: true,
        fullName: true,
        preferredPremium: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ newBusiness }, { status: 200 });
  } catch (error) {
    console.error("ERROR: Fetching new business failed", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
