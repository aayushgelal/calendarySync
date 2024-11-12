import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { NextAuthOptions } from '../auth/[...nextauth]/route';
import { google } from 'googleapis';

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
      sourceProvider,
      targetProvider,
      sourceAccountId,
      targetAccountId,
      hideDetails,
      weekdaysOnly,
      workingHoursStart,
      workingHoursEnd,
      roundToNearest,
    } = body;

    // Validate required fields
    if (!sourceCalendarId || !targetCalendarId || !sourceProvider || !targetProvider) {
      return NextResponse.json(
        { error: 'Source and target calendar details are required' },
        { status: 400 }
      );
    }

    // Validate source account
    const sourceAccount = await prisma.account.findFirst({
      where: { 
        userId: session.user.id,
        provider: sourceProvider 
      }
    });

    if (!sourceAccount) {
      return NextResponse.json(
        { error: 'Source account not found or unauthorized' },
        { status: 401 }
      );
    }

    // Validate target account
    const targetAccount = await prisma.account.findFirst({
      where: { 
        userId: session.user.id,
        provider: targetProvider 
      }
    });

    if (!targetAccount) {
      return NextResponse.json(
        { error: 'Target account not found or unauthorized' },
        { status: 401 }
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
        sourceAccountId,
        sourceProvider: targetProvider,
        targetAccountId
        
      },
    });
    console.log(sourceProvider)

    // Set up webhook based on source provider
    if (sourceProvider === 'google') {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      oauth2Client.setCredentials({
        access_token: sourceAccount.access_token,
        refresh_token: sourceAccount.refresh_token,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Set up watch for calendar changes
      const watchResponse = await calendar.events.watch({
        calendarId: sourceCalendarId,
        requestBody: {
          id: sync.id.toString(),
          type: 'web_hook',
          address: `${process.env.NEXTAUTH_URL}/api/webhook/google`,
          token: process.env.WEBHOOK_VERIFICATION_TOKEN,
          expiration: (Date.now() + 7 * 24 * 60 * 60 * 1000).toString(), // 7 days from now
        },
      });

      // Store webhook details
      await prisma.calendarSync.update({
        where: { id: sync.id },
        data: {
          webhookChannelId: watchResponse.data.resourceId,
          webhookExpiration: new Date(parseInt(watchResponse.data.expiration || '0')),
        },
      });
    } else if (sourceProvider === 'microsoft') {
      // Microsoft Graph Change Notifications
      const accessToken = sourceAccount.access_token;
      
      const subscriptionResponse = await fetch('https://graph.microsoft.com/v1.0/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          changeType: 'created,updated,deleted',
          notificationUrl: `${process.env.NEXTAUTH_URL}/api/webhook/microsoft`,
          resource: `me/calendars/${sourceCalendarId}/events`,
          expirationDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          clientState: process.env.WEBHOOK_VERIFICATION_TOKEN
        })
      });

      const subscriptionData = await subscriptionResponse.json();

      // Store webhook details
      await prisma.calendarSync.update({
        where: { id: sync.id },
        data: {
          webhookChannelId: subscriptionData.id,
          webhookExpiration: new Date(subscriptionData.expirationDateTime),
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