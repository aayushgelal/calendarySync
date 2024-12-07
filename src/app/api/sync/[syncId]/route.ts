import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ syncId: string }> }

) {
  const { syncId } = await params;

  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sync = await prisma.calendarSync.findUnique({
      where: {
        id: syncId,
      },
    });

    if (!sync || sync.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.calendarSync.delete({
      where: {
        id: syncId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sync:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}