import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';
import { getGoogleOAuthClient, getMicrosoftAccessToken } from '@/lib/getTokens';

export async function GET() {
  const expiringSyncs = await prisma.calendarSync.findMany({
    where: {
      webhookExpiration: {
        lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days before expiration
      }
    }
  });

  for (const sync of expiringSyncs) {
    try {
      if (sync.sourceProvider === 'google') {
        const { oauth2Client } = await getGoogleOAuthClient(sync.sourceAccountId);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const watchResponse = await calendar.events.watch({
          calendarId: sync.sourceCalendarId,
          requestBody: {
            id: sync.id.toString(),
            type: 'web_hook',
            address: `${process.env.NEXTAUTH_URL}/api/webhook/google`,
            token: process.env.WEBHOOK_VERIFICATION_TOKEN,
            expiration: (Date.now() + 7 * 24 * 60 * 60 * 1000).toString(), // 7 days from now
          },
        });

        await prisma.calendarSync.update({
          where: { id: sync.id },
          data: {
            webhookChannelId: watchResponse.data.resourceId,
            webhookExpiration: new Date(parseInt(watchResponse.data.expiration || '0')),
          },
        });
      } else if (sync.sourceProvider === 'microsoft') {
        const accessToken = await getMicrosoftAccessToken(sync.sourceAccountId);
        
        const subscriptionResponse = await fetch('https://graph.microsoft.com/v1.0/subscriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            changeType: 'created,updated,deleted',
            notificationUrl: `${process.env.NEXTAUTH_URL}/api/webhook/microsoft`,
            resource: `me/calendars/${sync.sourceCalendarId}/events`,
            expirationDateTime: (Date.now() + 1 * 24 * 60 * 60 * 1000).toString(),
            clientState: process.env.WEBHOOK_VERIFICATION_TOKEN
          })
        });

        const subscriptionData = await subscriptionResponse.json();

        await prisma.calendarSync.update({
          where: { id: sync.id },
          data: {
            webhookChannelId: subscriptionData.id,
            webhookExpiration: new Date(subscriptionData.expirationDateTime),
          },
        });
      }
    } catch (error) {
      console.error(`Error renewing webhook for sync ${sync.id}:`, error);
    }
  }
}