import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../../lib/prisma";

// Verify CAPTCHA function
async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${secret}&response=${token}`,
  });

  const data = await res.json();
  return data.success;
}

export async function POST(req: Request) {
  const { email, password, captchaToken } = await req.json();

  // ✅ Validate reCAPTCHA
  const captchaValid = await verifyCaptcha(captchaToken);
  if (!captchaValid) {
    return NextResponse.json({ message: "CAPTCHA verification failed" }, { status: 403 });
  }

  // ✅ Find PolicyHolder by email
  const policyHolder = await prisma.policyHolder.findUnique({ where: { email } });
  if (!policyHolder) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  // ✅ Compare password
  const isPasswordValid = await bcrypt.compare(password, policyHolder.password);
  if (!isPasswordValid) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  // ✅ Return email upon successful login
  return NextResponse.json({
    message: "Login successful",
    role: "POLICYHOLDER",
    email: policyHolder.email,
  });
}
