// /app/api/connections/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextAuthOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(NextAuthOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get all accounts for the user
    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        provider: true,
        id: true,
        access_token: true,
      }
    });

    // Create a map of provider connections with account details
    const connections = accounts.reduce((acc, account) => {
      acc[account.provider] = {
        connected: true,
        accountId: account.id,
        hasValidToken: !!account.access_token,
      };
      return acc;
    }, {} as Record<string, { connected: boolean; accountId: string; hasValidToken: boolean; }>);

    // Ensure all supported providers are represented
    const supportedProviders = ['google', 'microsoft'];
    supportedProviders.forEach(provider => {
      if (!connections[provider]) {
        connections[provider] = {
          connected: false,
          accountId: '',
          hasValidToken: false,
        };
      }
    });

    return NextResponse.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}