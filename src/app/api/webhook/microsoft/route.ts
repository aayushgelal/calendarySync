import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import syncEventToTargetCalendar from '@/lib/syncToCalendar';
import { getMicrosoftAccessToken } from '@/lib/getTokens';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const validationToken=searchParams.get('validationToken');


     if (validationToken) {
      // Return the validation token in plain text
      return new Response(validationToken, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    const {value:body}=await req.json();

    // Process notification events
    console.log('Notification received:', body);
  
    // Find sync configurations matching the calendar
    const sync = await prisma.calendarSync.findFirst({
      where: { 
        webhookChannelId: body[0]!.subscriptionId,
        sourceProvider: 'azure-ad'
      }
    });
    console.log(sync)
    
    if(sync){


      // Get Microsoft access token
      const accessToken = await getMicrosoftAccessToken(sync!.sourceAccountId);
          // Check if the token is expired
   
      // Fetch event details
      const eventResponse = await fetch(`https://graph.microsoft.com/v1.0/me/events/${body[0].resourceData.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const event = await eventResponse.json();

      // Process event synchronization
      await syncEventToTargetCalendar(sync, event);
    }

    

    return NextResponse.json({ success: true,  },{status:200});
  } catch (error) {
    console.error('Microsoft Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}