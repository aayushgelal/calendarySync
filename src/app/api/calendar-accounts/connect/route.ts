
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
      const { provider, email, accessToken, refreshToken, calendarId, name } = await req.json();
  
      // Check if this is the first account for the user
      const existingAccounts = await prisma.calendarAccount.count({
        where: {
          userId: session.user.id,
        },
      });
  
      // Create the new calendar account
      const account = await prisma.calendarAccount.create({
        data: {
          userId: session.user.id,
          provider,
          email,
          calendarId,
          name,
          accessToken,
          refreshToken,
          tokenExpiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
          isDefault: existingAccounts === 0, // Make default if it's the first account
        },
      });
  
      return NextResponse.json({ account }, { status: 201 });
    } catch (error) {
      console.error('Error connecting calendar account:', error);
      return NextResponse.json({ error: 'Failed to connect account' }, { status: 500 });
    }
  }