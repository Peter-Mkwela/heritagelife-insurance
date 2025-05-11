// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the cookie
  (await
    // Clear the cookie
    cookies()).delete('session_token');
  
  return NextResponse.json(
    { message: 'Logout successful' },
    { status: 200 }
  );
}