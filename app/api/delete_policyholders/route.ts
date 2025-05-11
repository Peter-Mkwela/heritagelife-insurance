import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '../../../lib/prisma'; // Adjust the path to your prisma instance

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'Policyholder ID is required' }, { status: 400 });
    }

    await prisma.policyHolder.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Policyholder deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting policyholder' }, { status: 500 });
  }
}
