import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import syncEventToTargetCalendar from '@/lib/syncToCalendar';
import { getMicrosoftAccessToken } from '@/lib/getTokens';

// export async function POST(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const validationToken=searchParams.get('validationToken');


//      if (validationToken) {
//       // Return the validation token in plain text
//       return new Response(validationToken, {
//         status: 200,
//         headers: { 'Content-Type': 'text/plain' },
//       });
//     }
//     const {value:body}=await req.json();

//     // Process notification events
//     console.log('Notification received:', body);
  
//     // Find sync configurations matching the calendar
//     const sync = await prisma.calendarSync.findFirst({
//       where: { 
//         webhookChannelId: body[0]!.subscriptionId,
//         sourceProvider: 'azure-ad'
//       }
//     });
//     console.log(sync)
    
//     if(sync){


//       // Get Microsoft access token
//       const accessToken = await getMicrosoftAccessToken(sync!.sourceAccountId);
//           // Check if the token is expired
   
//       // Fetch event details
//       const eventResponse = await fetch(`https://graph.microsoft.com/v1.0/me/events/${body[0].resourceData.id}`, {
//         headers: { 'Authorization': `Bearer ${accessToken}` }
//       });
//       const event = await eventResponse.json();

//       // Process event synchronization
//       await syncEventToTargetCalendar(sync, event);
//     }

    

//     return NextResponse.json({ success: true,  },{status:200});
//   } catch (error) {
//     console.error('Microsoft Webhook Error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const validationToken = searchParams.get('validationToken');

    if (validationToken) {
      // Return the validation token in plain text
      return new Response(validationToken, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    
    // Parse body carefully in case of empty or invalid payload
    let body;
    try {
      const jsonData = await req.json();
      body = jsonData.value;
      
      if (!body || !Array.isArray(body) || body.length === 0) {
        console.warn('Empty or invalid notification payload');
        return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }

    // Process notification events
    console.log('Notification received:', body);
  
    // Find sync configurations matching the calendar
    const sync = await prisma.calendarSync.findFirst({
      where: { 
        webhookChannelId: body[0].subscriptionId,
        sourceProvider: 'azure-ad'
      }
    });
    
    if (sync) {
      // Get Microsoft access token
      const accessToken = await getMicrosoftAccessToken(sync.sourceAccountId);
      
      // Make sure we have an event ID to fetch
      if (!body[0].resourceData?.id) {
        console.error('No resource ID in notification');
        return NextResponse.json({ success: false, error: 'No resource ID' }, { status: 400 });
      }
      
      // Fetch event details
      const eventResponse = await fetch(`https://graph.microsoft.com/v1.0/me/events/${body[0].resourceData.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!eventResponse.ok) {
        console.error('Failed to fetch event details:', await eventResponse.text());
        return NextResponse.json({ success: false, error: 'Failed to fetch event' }, { status: 500 });
      }
      
      const event = await eventResponse.json();

      // Process event synchronization
      await syncEventToTargetCalendar(sync, event);
    } else {
      console.warn('No matching sync configuration found for subscription ID:', body[0].subscriptionId);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Microsoft Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}