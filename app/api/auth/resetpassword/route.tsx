// app/api/auth/resetpassword/route.ts

import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma"; // Prisma instance for database interaction
import nodemailer from "nodemailer"; // For sending email
import crypto from "crypto"; // For generating reset token

export async function POST(req: Request) {
  const { email } = await req.json();

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ message: "Email not found" }, { status: 404 });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expirationTime = Date.now() + 3600000; // 1 hour expiration

  // Save token and expiration time in the database (for later verification)

  // Send email with reset link
  const transporter = nodemailer.createTransport({ /* your email config */ });
  await transporter.sendMail({
    from: "your-email@example.com",
    to: email,
    subject: "Password Reset",
    text: `Click the following link to reset your password: ${process.env.BASE_URL}/reset-password?token=${resetToken}`,
  });

  return NextResponse.json({ message: "Password reset link sent to email" });
}
