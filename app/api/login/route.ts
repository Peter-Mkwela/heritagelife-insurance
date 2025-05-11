import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../lib/prisma';

type Role = 'system_admin' | 'agent' | 'stakeholder' | 'it_admin' | 'policyholder';

export async function POST(req: Request) {
  const { username, password, intendedRoute } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
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

  console.log({
    cleanIntendedRoute,
    cleanRole,
    expectedPrefix,
  });

  if (!cleanIntendedRoute.startsWith(expectedPrefix)) {
    return NextResponse.json(
      {
        error: `Role does not match the intended route`,
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: 'Login successful',
    role: user.role,
    token: 'jwt-token-here',
    intendedRoute: cleanIntendedRoute,
  });
}
