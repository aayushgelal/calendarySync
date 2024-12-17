import { google } from 'googleapis';
import { prisma } from './prisma';
import { getGoogleOAuthClient, getMicrosoftAccessToken } from './getTokens';
import { CalendarSync } from '@prisma/client';

async function stopGoogleWebhook(channelId: string, resourceId: string, accountId: string) {
  try {
    const { oauth2Client } = await getGoogleOAuthClient(accountId);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.channels.stop({
      requestBody: {
        id: channelId,
        resourceId: resourceId
      }
    });

    console.log('Successfully stopped Google webhook');
  } catch (error) {
    console.error('Error stopping Google webhook:', error);
    // Don't throw - we want to continue cleanup even if webhook stop fails
  }
}

async function stopMicrosoftWebhook(subscriptionId: string, accountId: string) {
  try {
    const accessToken = await getMicrosoftAccessToken(accountId);
    
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to stop Microsoft webhook: ${response.statusText}`);
    }

    console.log('Successfully stopped Microsoft webhook');
  } catch (error) {
    console.error('Error stopping Microsoft webhook:', error);
    // Don't throw - we want to continue cleanup even if webhook stop fails
  }
}

export async function deleteWebhook(sync: CalendarSync) {
  try {
    // Get the source account to determine the provider
    const sourceAccount = await prisma.account.findFirst({
      where: {
        id: sync.sourceAccountId
      }
    });

    if (!sourceAccount) {
      console.error('Source account not found for sync:', sync.id);
      return;
    }

    // Stop the webhook based on provider
    if (sourceAccount.provider === 'google') {
      if (sync.webhookChannelId && sync.webhookResourceId) {
        await stopGoogleWebhook(
          sync.webhookChannelId,
          sync.webhookResourceId,
          sync.sourceAccountId
        );
      }
    } else if (sourceAccount.provider === 'azure-ad') {
      if (sync.webhookChannelId) {
        await stopMicrosoftWebhook(
          sync.webhookChannelId,
          sync.sourceAccountId
        );
      }
    }

    // Clear webhook data from the sync record
    await prisma.calendarSync.update({
      where: { id: sync.id },
      data: {
        webhookChannelId: null,
        webhookResourceId: null,
        webhookExpiration: null
      }
    });

    console.log('Successfully deleted webhook for sync:', sync.id);
  } catch (error) {
    console.error('Error deleting webhook:', error);
    // Don't throw - this is cleanup code
  }
} 