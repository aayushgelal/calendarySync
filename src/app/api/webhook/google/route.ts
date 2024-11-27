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
      const channelId = req.headers.get('X-Goog-Channel-id');
      const sync = await prisma.calendarSync.findFirst({
        where: { id: channelId! }
      });
  
      if (!sync) {
        return NextResponse.json({ error: 'Sync not found' }, { status: 404 });
      }
  
      // Get OAuth client for source account
      const { oauth2Client } = await getGoogleOAuthClient(sync.sourceAccountId);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const updatedEvents = await calendar.events.list({
        calendarId: sync.sourceCalendarId,
        updatedMin: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        orderBy: 'updated', // Sort events by their last updated time
        singleEvents: true, // Ensure each event is returned as a single event (not recurring series) // Fetch changes from the last 5 minutes
      });
      console.log(updatedEvents.data.items)
      const event = updatedEvents!.data!.items![updatedEvents!.data!.items!.length - 1];
      
      
  
      // Fetch the modified event
      // const eventId = req.headers.get('X-Goog-Resource-ID');
      // console.log('eventid',eventId,'sync source',sync.sourceCalendarId)
      // const event = await calendar.events.get({
      //   calendarId: sync.sourceCalendarId,
      //   eventId: eventId || undefined
      // });
      // console.log('passed')
  
      // Process event synchronization
      await syncEventToTargetCalendar(sync, event);
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Google Webhook Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }