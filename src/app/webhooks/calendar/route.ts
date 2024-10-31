// src/app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { calendarId, resourceId, token } = body;

    // Verify the webhook is legitimate
    if (token !== process.env.WEBHOOK_VERIFICATION_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find all syncs that use this calendar as source
    const syncs = await prisma.calendarSync.findMany({
      where: {
        sourceCalendarId: calendarId,
      },
      include: {
        user: {
          include: {
            accounts: true,
          },
        },
      },
    });

    for (const sync of syncs) {
      const account = sync.user.accounts.find(
        (acc:any) => acc.provider === 'google'
      );
      
      if (!account) continue;

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Get the updated event
      const { data: event } = await calendar.events.get({
        calendarId,
        eventId: resourceId,
      });

      if (!event) continue;

      // Check if event is within working hours
      if (sync.weekdaysOnly) {
        const eventDate = new Date(event.start?.dateTime || event.start?.date || '');
        if (eventDate.getDay() === 0 || eventDate.getDay() === 6) continue;
      }

      // Round event times if needed
      if (sync.roundToNearest > 0) {
        const roundToMs = sync.roundToNearest * 60 * 1000;
        if (event.start?.dateTime) {
          const startTime = new Date(event.start.dateTime).getTime();
          event.start.dateTime = new Date(
            Math.round(startTime / roundToMs) * roundToMs
          ).toISOString();
        }
        if (event.end?.dateTime) {
          const endTime = new Date(event.end.dateTime).getTime();
          event.end.dateTime = new Date(
            Math.round(endTime / roundToMs) * roundToMs
          ).toISOString();
        }
      }

      // Create or update event in target calendar
      if (sync.hideDetails) {
        event.summary = 'Busy';
        event.description = '';
        event.attendees = [];
        event.location = '';
      }

      await calendar.events.insert({
        calendarId: sync.targetCalendarId,
        requestBody: event,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
