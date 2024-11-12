import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';

// Helper function to get OAuth2 client for Google
async function getGoogleOAuthClient(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });

  if (!account) {
    throw new Error('Account not found');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  return { oauth2Client, account };
}

// Helper function to get Microsoft Graph access token
async function getMicrosoftAccessToken(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });

  if (!account) {
    throw new Error('Account not found');
  }

  return account.access_token;
}

export {getGoogleOAuthClient,getMicrosoftAccessToken}