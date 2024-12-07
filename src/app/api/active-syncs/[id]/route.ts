import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextAuthOptions } from '../../auth/[...nextauth]/route';
import { google } from 'googleapis';
import { getGoogleOAuthClient, getMicrosoftAccessToken } from '@/lib/getTokens';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await getServerSession(NextAuthOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hideDetails } = await request.json();

    // First verify the sync belongs to the user
    const existingSync = await prisma.calendarSync.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingSync) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updatedSync = await prisma.calendarSync.update({
      where: { id: id },
      data: { hideDetails },
      select: {
        id: true,
        hideDetails: true,
        sourceCalendarName: true,
        targetCalendarName: true,
        sourceAccount: {
          select: {
            email: true,
          },
        },
        targetAccount: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSync);
  } catch (error) {
    console.error('Error updating sync:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}



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
    throw error;
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
    throw error;
  }
}

async function stopWebhooks(sync: any) {
  try {
    if (sync.webhookChannelId) {
      if (sync.sourceProvider === 'google') {
        await stopGoogleWebhook(
          sync.webhookChannelId,
          sync.webhookResourceId, // Make sure to add this field to your schema
          sync.sourceAccountId
        );
      } else if (sync.sourceProvider === 'azure-ad') {
        await stopMicrosoftWebhook(
          sync.webhookChannelId,
          sync.sourceAccountId
        );
      }
    }
  } catch (error) {
    console.error('Error stopping webhooks:', error);
    throw error;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(NextAuthOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Fetch the sync with all necessary details
    const existingSync = await prisma.calendarSync.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        sourceProvider: true,
        sourceAccountId: true,
        webhookChannelId: true,
        webhookResourceId: true, // Add this field to your schema
      },
    });

    if (!existingSync) {
      return NextResponse.json(
        { error: 'Sync not found' }, 
        { status: 404 }
      );
    }

    // Stop webhooks first
    await stopWebhooks(existingSync);

    // Then delete the sync
    await prisma.calendarSync.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in delete sync handler:', error);
    return NextResponse.json(
      { error: 'Failed to delete sync' }, 
      { status: 500 }
    );
  }
}

