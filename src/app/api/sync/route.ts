// src/app/api/sync/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';
import { NextAuthOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(NextAuthOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      sourceCalendarId,
      targetCalendarId,
      hideDetails,
      weekdaysOnly,
      workingHoursStart,
      workingHoursEnd,
      roundToNearest,
    } = body;

    // Validate required fields
    if (!sourceCalendarId || !targetCalendarId) {
      return NextResponse.json(
        { error: 'Source and target calendars are required' },
        { status: 400 }
      );
    }

    // Check if sync already exists
    const existingSync = await prisma.calendarSync.findFirst({
      where: {
        userId: session.user.id,
        sourceCalendarId,
        targetCalendarId,
      },
    });

    if (existingSync) {
      return NextResponse.json(
        { error: 'A sync already exists for these calendars' },
        { status: 400 }
      );
    }

    // Create new sync
    const sync = await prisma.calendarSync.create({
      data: {
        userId: session.user.id,
        sourceCalendarId,
        targetCalendarId,
        hideDetails: hideDetails ?? true,
        weekdaysOnly: weekdaysOnly ?? true,
        workingHoursStart: workingHoursStart ?? '09:00',
        workingHoursEnd: workingHoursEnd ?? '17:00',
        roundToNearest: roundToNearest ?? 15,
      },
    });

    // Set up Google Calendar webhook
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    if (account) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Set up watch for calendar changes
      await calendar.events.watch({
        calendarId: sourceCalendarId,
        requestBody: {
          id: sync.id,
          type: 'web_hook',
          address: `${process.env.NEXTAUTH_URL}/api/webhook`,
          token: process.env.WEBHOOK_VERIFICATION_TOKEN,
        },
      });
    }

    return NextResponse.json(sync);
  } catch (error) {
    console.error('Error creating sync:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}