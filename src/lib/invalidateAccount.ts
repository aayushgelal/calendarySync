import { prisma } from "./prisma";

export async function invalidateAccount(account: {
  provider: string;
  providerAccountId: string;
  userId: string;
}) {
  try {
    // 1. Find all active syncs for this account
    const activeCalendarSyncs = await prisma.calendarSync.findMany({
      where: {
        OR: [
          { sourceAccountId: account.providerAccountId },
          { targetAccountId: account.providerAccountId }
        ],
        userId: account.userId
      }
    });

    // 2. Delete each sync using the existing API
    for (const sync of activeCalendarSyncs) {
      try {
        await fetch(`/api/active-syncs/${sync.id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error(`Failed to delete sync ${sync.id}:`, error);
      }
    }

    // 3. Clear tokens from the account
    await prisma.account.update({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
      data: {
        refresh_token: null,
        access_token: null,
        expires_at: null,
      },
    });

    return true;
  } catch (error) {
    console.error('Error invalidating account:', error);
    return false;
  }
} 