// import { getGoogleOAuthClient } from "@/lib/getTokens";
// import { prisma } from "@/lib/prisma";
// import syncEventToTargetCalendar from "@/lib/syncToCalendar";
// import { google } from "googleapis";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//     // Verify webhook token
//     const token = req.headers.get('X-Goog-Channel-Token');
//     if (token !== process.env.WEBHOOK_VERIFICATION_TOKEN) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }
  
//     try {
//       // Find the sync configuration based on the channel ID
//       const channelId = req.headers.get('X-Goog-Channel-id');
//       const sync = await prisma.calendarSync.findFirst({
//         where: { id: channelId! }
//       });
  
//       if (!sync) {
//         return NextResponse.json({ error: 'Sync not found' }, { status: 404 });
//       }
  
//       // Get OAuth client for source account
//       const { oauth2Client } = await getGoogleOAuthClient(sync.sourceAccountId);
//       const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
//       const updatedEvents = await calendar.events.list({
//         calendarId: sync.sourceCalendarId,
//         updatedMin: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
//         orderBy: 'updated', // Sort events by their last updated time
//         singleEvents: true, // Ensure each event is returned as a single event (not recurring series) // Fetch changes from the last 5 minutes
//       });
//       console.log(updatedEvents.data.items)
//       const event = updatedEvents!.data!.items![updatedEvents!.data!.items!.length - 1];
      
      
  
//       // Fetch the modified event
//       // const eventId = req.headers.get('X-Goog-Resource-ID');
//       // console.log('eventid',eventId,'sync source',sync.sourceCalendarId)
//       // const event = await calendar.events.get({
//       //   calendarId: sync.sourceCalendarId,
//       //   eventId: eventId || undefined
//       // });
//       // console.log('passed')
  
//       // Process event synchronization
//       await syncEventToTargetCalendar(sync, event);
  
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       console.error('Google Webhook Error:', error);
//       return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//     }
//   }


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
      where: { id: channelId! }
    });

    if (!sync) {
      return NextResponse.json({ error: 'Sync not found' }, { status: 404 });
    }

    // Get OAuth client for source account
    const { oauth2Client } = await getGoogleOAuthClient(sync.sourceAccountId);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Get the resource state
    const resourceState = req.headers.get('X-Goog-Resource-State');
    
    // If this is just a sync notification, respond immediately
    if (resourceState === 'sync') {
      return NextResponse.json({ success: true });
    }
    
    // Get the resource ID from the headers
    const resourceId = req.headers.get('X-Goog-Resource-ID');
    
    // If we have a resource ID and it's an update or exists state
    if (resourceId && (resourceState === 'exists' || resourceState === 'update')) {
      try {
        // Try to get the specific event that was updated
        const eventResponse = await calendar.events.get({
          calendarId: sync.sourceCalendarId,
          eventId: resourceId
        });
        
        if (eventResponse.data) {
          await syncEventToTargetCalendar(sync, eventResponse.data);
          return NextResponse.json({ success: true });
        }
      } catch (error) {
        console.error('Error getting specific event:', error);
        // Fall back to fetching recent events
      }
    }
    
    // Fall back to getting recently updated events
    const updatedEvents = await calendar.events.list({
      calendarId: sync.sourceCalendarId,
      updatedMin: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Last 5 minutes
      orderBy: 'updated',
      singleEvents: true,
      maxResults: 10
    });
    
    if (updatedEvents.data.items && updatedEvents.data.items.length > 0) {
      // Process the most recently updated event
      const latestEvent = updatedEvents.data.items[updatedEvents.data.items.length - 1];
      await syncEventToTargetCalendar(sync, latestEvent);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}