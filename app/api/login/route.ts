import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../lib/prisma';

type Role = 'system_admin' | 'agent' | 'stakeholder' | 'it_admin' | 'policyholder';

const verifyCaptcha = async (token: string) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secret}&response=${token}`,
  });

  const data = await response.json();
  return data.success;
};

export async function POST(req: Request) {
  const { username, password, intendedRoute, captchaToken } = await req.json();

  if (!username || !password || !captchaToken || !intendedRoute) {
    return NextResponse.json({
      error: 'Missing required fields: username, password, captchaToken, or intendedRoute',
    }, { status: 400 });
  }
  

  const isHuman = await verifyCaptcha(captchaToken);
  if (!isHuman) {
    return NextResponse.json({ error: 'CAPTCHA verification failed' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const roleRoutePrefixMap: Record<Role, string> = {
    system_admin: '/system_admin',
    agent: '/agent',
    stakeholder: '/stakeholder',
    it_admin: '/it_admin',
    policyholder: '/policyholder',
  };

  const cleanIntendedRoute = intendedRoute?.toLowerCase().trim() || '';
  const cleanRole = user.role?.toLowerCase().trim() as Role;
  const expectedPrefix = roleRoutePrefixMap[cleanRole];

  if (!cleanIntendedRoute.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: `Role does not match the intended route` }, { status: 403 });
  }

  return NextResponse.json({
    message: 'Login successful',
    role: user.role,
    token: 'jwt-token-here',
    intendedRoute: cleanIntendedRoute,
    agent_id: user.id,
  });
}
