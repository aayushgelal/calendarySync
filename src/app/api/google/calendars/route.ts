import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextAuthOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(NextAuthOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session!.user.id,
        provider: 'google',
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'No Google account found' }, { status: 404 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.calendarList.list();

    return NextResponse.json(response.data.items);
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 });
  }
}