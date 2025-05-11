// app/api/get_users/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Adjust the import path if needed

// This will handle the GET request to fetch all users
export async function GET() {
  try {
    const users = await prisma.user.findMany(); // Fetch users from the database
    return NextResponse.json({ users }); // Return the users as JSON
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
