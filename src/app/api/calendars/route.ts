import { NextResponse } from 'next/server';
import { MicrosoftGraph, GoogleCalendarAPI } from '@/lib/api-client';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextAuthOptions } from '../auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(NextAuthOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider');
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

    if (!account) {
      return NextResponse.json({
        error: `No ${provider ? provider + ' ' : ''}calendar account found`,
      }, { status: 404 });
    }

    // Fetch calendars based on the provider
    let calendars;
    if (provider === 'azure-ad') {
      calendars = await MicrosoftGraph.getCalendars(account.access_token!);
    } else if (provider === 'google') {
      calendars = await GoogleCalendarAPI.getCalendars(account.access_token!);
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

    return NextResponse.json({ calendars: calendars }, { status: 200 });
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 });
  }
}
