import { prisma } from "./prisma";

async function refreshAccessToken(account: any) {
    try {
      let url: string;
      let body: URLSearchParams;
  
      if (account.provider === 'google') {
        url = 'https://oauth2.googleapis.com/token';
        body = new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: account.refresh_token!,
          grant_type: 'refresh_token',
        });
      } else if (account.provider === 'azure-ad') {
        url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        body = new URLSearchParams({
          client_id: process.env.AZURE_AD_CLIENT_ID!,
          client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
          refresh_token: account.refresh_token!,
          grant_type: 'refresh_token',
        });
      } else {
        throw new Error('Unsupported provider');
      }
  
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
  
      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }
  
      const tokens = await response.json();
  
      // Update the account in the database
      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        data: {
          access_token: tokens.access_token,
          expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in, // Calculate expiry time
          refresh_token: tokens.refresh_token || account.refresh_token, // Retain old refresh token if not returned
        },
      });
  
      return tokens.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Unable to refresh access token');
    }
  }
export default refreshAccessToken;