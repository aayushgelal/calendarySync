import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import syncEventToTargetCalendar from '@/lib/syncToCalendar';
import { getMicrosoftAccessToken } from '@/lib/getTokens';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('created')
    
    // Validate client state
    if (body.clientState !== process.env.WEBHOOK_VERIFICATION_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validation request handling (Microsoft sends validation requests)
    if (body.validationTokens) {
      return new Response(body.validationTokens[0], { 
        status: 200, 
        headers: { 'Content-Type': 'text/plain' } 
      });
    }

    // Find sync configurations matching the calendar
    const syncs = await prisma.calendarSync.findMany({
      where: { 
        sourceCalendarId: body.resourceData.id,
        sourceProvider: 'microsoft'
      }
    });

    for (const sync of syncs) {
      // Get Microsoft access token
      const accessToken = await getMicrosoftAccessToken(sync.sourceAccountId);

      // Fetch event details
      const eventResponse = await fetch(`https://graph.microsoft.com/v1.0/me/events/${body.resourceData.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const event = await eventResponse.json();

      // Process event synchronization
      await syncEventToTargetCalendar(sync, event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Microsoft Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}