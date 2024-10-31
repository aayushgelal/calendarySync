// app/api/calendar-accounts/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextAuthOptions } from '../auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(NextAuthOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accounts = await prisma.calendarAccount.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        isDefault: 'desc',
      },
    });

    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching calendar accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

