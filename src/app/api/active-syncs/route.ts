import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextAuthOptions } from '@/utils/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(NextAuthOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const syncs = await prisma.calendarSync.findMany({
      where: { 
        userId: session.user.id 
      },
      select: {
        id: true,
        hideDetails: true,
        sourceCalendarName: true,
        targetCalendarName: true,
        sourceAccount: {
          select: {
            email: true,
          },
        },
        targetAccount: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json(syncs);
  } catch (error) {
    console.error('Error fetching syncs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}