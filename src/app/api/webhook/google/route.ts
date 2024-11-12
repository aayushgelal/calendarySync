import { getGoogleOAuthClient } from "@/lib/getTokens";
import { prisma } from "@/lib/prisma";
import syncEventToTargetCalendar from "@/lib/syncToCalendar";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // Verify webhook token
    const token = req.headers.get('X-Goog-Channel-Token');
    if (token !== process.env.WEBHOOK_VERIFICATION_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      // Find the sync configuration based on the channel ID
      const channelId = req.headers.get('X-Goog-Channel-ID');
      const sync = await prisma.calendarSync.findFirst({
        where: { webhookChannelId: channelId }
      });
  
      if (!sync) {
        return NextResponse.json({ error: 'Sync not found' }, { status: 404 });
      }
  
      // Get OAuth client for source account
      const { oauth2Client } = await getGoogleOAuthClient(sync.sourceAccountId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
      // Fetch the modified event
      const eventId = req.headers.get('X-Goog-Resource-ID');
      const event = await calendar.events.get({
        calendarId: sync.sourceCalendarId,
        eventId: eventId || undefined
      });
  
      // Process event synchronization
      await syncEventToTargetCalendar(sync, event.data);
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Google Webhook Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }