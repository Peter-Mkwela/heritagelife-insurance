import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Ensure this is the correct path to your Prisma instance
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, role, full_name } = body;

    // Validate required fields
    if (!username || !email || !password || !role || !full_name) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        full_name,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Failed to create user', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
