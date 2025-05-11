// app/api/delete_user/route.ts

import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';  // Ensure this is correctly importing your Prisma instance

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json(); // Get the user ID from the request body

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Delete the user from the database
    const deletedUser = await prisma.user.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
