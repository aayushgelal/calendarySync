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


// import { getGoogleOAuthClient } from "@/lib/getTokens";
// import { prisma } from "@/lib/prisma";
// import syncEventToTargetCalendar from "@/lib/syncToCalendar";
// import { google } from "googleapis";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   // Verify webhook token
//   const token = req.headers.get('X-Goog-Channel-Token');
//   if (token !== process.env.WEBHOOK_VERIFICATION_TOKEN) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     // Find the sync configuration based on the channel ID
//     const channelId = req.headers.get('X-Goog-Channel-ID');
//     const sync = await prisma.calendarSync.findFirst({
//       where: { id: channelId! }
//     });

//     if (!sync) {
//       return NextResponse.json({ error: 'Sync not found' }, { status: 404 });
//     }

//     // Get OAuth client for source account
//     const { oauth2Client } = await getGoogleOAuthClient(sync.sourceAccountId);
//     const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
//     // Get the resource state
//     const resourceState = req.headers.get('X-Goog-Resource-State');
    
//     // If this is just a sync notification, respond immediately
//     if (resourceState === 'sync') {
//       return NextResponse.json({ success: true });
//     }
    
//     // Get the resource ID from the headers
//     const resourceId = req.headers.get('X-Goog-Resource-ID');
    
//     // If we have a resource ID and it's an update or exists state
//     if (resourceId && (resourceState === 'exists' || resourceState === 'update')) {
//       try {
//         // Try to get the specific event that was updated
//         const eventResponse = await calendar.events.get({
//           calendarId: sync.sourceCalendarId,
//           eventId: resourceId
//         });
        
//         if (eventResponse.data) {
//           await syncEventToTargetCalendar(sync, eventResponse.data);
//           return NextResponse.json({ success: true });
//         }
//       } catch (error) {
//         console.error('Error getting specific event:', error);
//         // Fall back to fetching recent events
//       }
//     }
    
//     // Fall back to getting recently updated events
//     const updatedEvents = await calendar.events.list({
//       calendarId: sync.sourceCalendarId,
//       updatedMin: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Last 5 minutes
//       orderBy: 'updated',
//       singleEvents: true,
//       maxResults: 10
//     });
    
//     if (updatedEvents.data.items && updatedEvents.data.items.length > 0) {
//       // Process the most recently updated event
//       const latestEvent = updatedEvents.data.items[updatedEvents.data.items.length - 1];
//       await syncEventToTargetCalendar(sync, latestEvent);
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Google Webhook Error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

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
    
    // Always use the reliable events.list approach
    const updatedEvents = await calendar.events.list({
      calendarId: sync.sourceCalendarId,
      updatedMin: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // Last 1 minute
      orderBy: 'updated',
      singleEvents: true,
      maxResults: 5,
      showDeleted: true // Include deleted events to handle deletions
    });
    
    if (updatedEvents.data.items && updatedEvents.data.items.length > 0) {
      // Process the most recently updated event
      const latestEvent = updatedEvents.data.items[updatedEvents.data.items.length - 1];
      
      // Check if the event is deleted
      if (latestEvent.status === 'cancelled') {
        console.log('Event was deleted:', latestEvent.id);
        // Handle deletion - you'll need to implement this based on your needs
        await handleEventDeletion(sync, latestEvent);
      } else {
        // Normal sync for created/updated events
        await syncEventToTargetCalendar(sync, latestEvent);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle event deletion
async function handleEventDeletion(sync: any, deletedEvent: any) {
  try {
    // You'll need to implement logic to remove the event from target calendar
    // This depends on how you track the relationship between source and target events
    
    console.log('Handling deletion for event:', deletedEvent.id);
    
    // Option 1: If you store source->target event ID mapping in database
    // const mapping = await prisma.eventMapping.findFirst({
    //   where: { 
    //     sourceEventId: deletedEvent.id,
    //     syncId: sync.id 
    //   }
    // });
    // 
    // if (mapping) {
    //   const { oauth2Client } = await getGoogleOAuthClient(sync.targetAccountId);
    //   const targetCalendar = google.calendar({ version: 'v3', auth: oauth2Client });
    //   
    //   await targetCalendar.events.delete({
    //     calendarId: sync.targetCalendarId,
    //     eventId: mapping.targetEventId
    //   });
    //   
    //   await prisma.eventMapping.delete({ where: { id: mapping.id } });
    // }
    
    // Option 2: Search for the event in target calendar by title/time
    // const { oauth2Client } = await getGoogleOAuthClient(sync.targetAccountId);
    // const targetCalendar = google.calendar({ version: 'v3', auth: oauth2Client });
    // 
    // const targetEvents = await targetCalendar.events.list({
    //   calendarId: sync.targetCalendarId,
    //   q: deletedEvent.summary, // Search by title
    //   timeMin: deletedEvent.start?.dateTime || deletedEvent.start?.date,
    //   timeMax: deletedEvent.end?.dateTime || deletedEvent.end?.date
    // });
    // 
    // if (targetEvents.data.items && targetEvents.data.items.length > 0) {
    //   const targetEvent = targetEvents.data.items[0];
    //   await targetCalendar.events.delete({
    //     calendarId: sync.targetCalendarId,
    //     eventId: targetEvent.id!
    //   });
    // }
    
  } catch (error) {
    console.error('Error handling event deletion:', error);
  }
}