// app/api/calendar-accounts/default/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextAuthOptions } from '../../auth/[...nextauth]/route';
export async function POST(req: Request) {
    const session = await getServerSession(NextAuthOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      const { accountId } = await req.json();
  
      // Update all accounts to non-default first
      await prisma.calendarAccount.updateMany({
        where: {
          userId: session.user.id,
        },
        data: {
          isDefault: false,
        },
      });
  
      // Set the selected account as default
      await prisma.calendarAccount.update({
        where: {
          id: accountId,
          userId: session.user.id,
        },
        data: {
          isDefault: true,
        },
      });
  
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Error setting default account:', error);
      return NextResponse.json({ error: 'Failed to set default account' }, { status: 500 });
    }
  }
  
  