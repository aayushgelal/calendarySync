import { NextResponse } from 'next/server';
import { MicrosoftGraph, GoogleCalendarAPI } from '@/lib/api-client';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextAuthOptions } from '@/utils/authOptions';

import refreshAccessToken from '@/lib/refreshaccessToken';

export async function GET(req: Request) {
  const session = await getServerSession(NextAuthOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider')
  const accountId = searchParams.get('accountId');

  try {
    // Fetch the calendar account based on accountId and provider
    const account = await prisma.account.findFirst({
      where: {
        id: accountId!,
        provider: provider!,
        userId: session.user.id, // Ensure this is for the logged-in user
      },
    });
    console.log(account)

    if (!account) {
      return NextResponse.json({
        error: `No ${provider ? provider + ' ' : ''}calendar account found`,
      }, { status: 404 });
    }


    let accessToken = account.access_token;

    // Check if the token is expired
    const now = Math.floor(Date.now() / 1000);
    if (account.expires_at && account.expires_at <= now) {
      console.log(`Token expired for ${provider}, refreshing...`);
      accessToken = await refreshAccessToken(account);
    }
    // Fetch calendars based on the provider
    let calendars;
    if (provider === 'azure-ad') {
      calendars = await MicrosoftGraph.getCalendars(accessToken!);
    } else if (provider === 'google') {
      calendars = await GoogleCalendarAPI.getCalendars(accessToken!);
    } else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    // Transform calendars to include account information
    // const transformedCalendars = calendars.map((calendar: any) => ({
    //   ...calendar,
    //   accountId: account.id,
    //   accountEmail: account.email,
    //   isDefault: account.isDefault,
    //   provider: account.provider,
    // }));

    return NextResponse.json({ calendars:calendars ,account:account }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' }, 
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch calendars' }, 
      { status: 500 }
    );
  }
}
