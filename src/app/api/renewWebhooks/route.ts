import { prisma } from '@/lib/prisma';
import refreshAccessToken from '@/lib/refreshaccessToken';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
    const now = new Date();
    const upcomingExpiry = new Date();
    upcomingExpiry.setHours(now.getHours() + 24); // Check webhooks expiring in the next 24 hours

    const expiringSyncs = await prisma.calendarSync.findMany({
      where: {
        webhookExpiration: { lte: upcomingExpiry },
      },
    });

    for (const sync of expiringSyncs) {
      if (sync.sourceProvider === 'google') {
        const account = await prisma.account.findUnique({
          where: { id: sync.sourceAccountId },
        });

        if (!account) continue;
        let accessToken = account.access_token;

        // Check if the token is expired
        const now = Math.floor(Date.now() / 1000);
        if (account.expires_at && account.expires_at <= now) {
          console.log(`Token expired for ${account.provider}, refreshing...`);
          accessToken = await refreshAccessToken(account);
        }

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
          access_token: account.access_token,
          refresh_token: account.refresh_token,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        if (sync.webhookChannelId) {
            try {
              await calendar.channels.stop({
                requestBody: {
                  id: sync.id.toString(),
                  resourceId: sync.webhookChannelId,
                },
              });
            } catch (error) {
              console.error('Error stopping old webhook:', error);
            }
          }
          
        const watchResponse = await calendar.events.watch({
          calendarId: sync.sourceCalendarId,
          requestBody: {
            id: sync.id.toString(),
            type: 'web_hook',
            address: `${process.env.NEXTAUTH_URL}/api/webhook/google`,
            token: process.env.WEBHOOK_VERIFICATION_TOKEN,
            expiration: (Date.now() + 7 * 24 * 60 * 60 * 1000).toString(), // Extend 7 days
          },
        });

        await prisma.calendarSync.update({
          where: { id: sync.id },
          data: {
            webhookChannelId: watchResponse.data.resourceId,
            webhookExpiration: new Date(parseInt(watchResponse.data.expiration || '0')),
          },
        });
      } else if (sync.sourceProvider === 'azure-ad') {
        const account = await prisma.account.findUnique({
          where: { id: sync.sourceAccountId },
        });

        if (!account) continue;

        const accessToken = account.access_token;

        const subscriptionResponse = await fetch('https://graph.microsoft.com/v1.0/subscriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            changeType: 'created,updated,deleted',
            notificationUrl: `${process.env.NEXTAUTH_URL}/api/webhook/microsoft`,
            resource: `me/calendars/${sync.sourceCalendarId}/events`,
            expirationDateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Extend 5 days
            clientState: process.env.WEBHOOK_VERIFICATION_TOKEN,
          }),
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
    }
    return NextResponse.json({ message:'done' }, { status: 200 });

  } catch (error) {
    console.error('Error renewing webhooks:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  }
}

// Schedule this function to run every hour or so
