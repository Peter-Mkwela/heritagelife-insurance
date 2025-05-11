// api/auth/login
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../../lib/prisma";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Find PolicyHolder by email
  const policyHolder = await prisma.policyHolder.findUnique({ where: { email } });
  if (!policyHolder) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, policyHolder.password);
  if (!isPasswordValid) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  // Return email upon successful login
  return NextResponse.json({
    message: "Login successful",
    role: "POLICYHOLDER",
    email: policyHolder.email, // Include email
  });
}
