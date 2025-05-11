// app/api/auth/signup/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../../lib/prisma"; // Prisma instance for database interaction

export async function POST(req: Request) {
  const { email, password, full_name } = await req.json();

  // Check if user exists
  const existingUser = await prisma.policyHolder.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: "User already exists!" }, { status: 400 });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new PolicyHolder
  const newUser = await prisma.policyHolder.create({
    data: {
      email,
      password: hashedPassword,
      full_name, // Include the full_name field
    },
  });

  return NextResponse.json({ message: "User created successfully!", user: newUser });
}
