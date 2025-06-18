import { prisma } from "./prisma";
import { invalidateAccount } from './invalidateAccount';

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
          access_type: 'offline',
          prompt: 'consent'
        });
      } else if (account.provider === 'azure-ad') {
        url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        body = new URLSearchParams({
          client_id: process.env.AZURE_AD_CLIENT_ID!,
          client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
          refresh_token: account.refresh_token!,
          grant_type: 'refresh_token',
          scope: 'openid email profile offline_access Mail.Send https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/Calendars.ReadWrite.Shared'
        });
      } else {
        throw new Error('Unsupported provider');
      }

      console.log('Refreshing token with params:', {
        provider: account.provider,
        accountId: account.providerAccountId,
        url
      });
  
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
  
      const responseData = await response.json();

      console.log('Token refresh response:', {
        status: response.status,
        hasAccessToken: !!responseData.access_token,
        hasRefreshToken: !!responseData.refresh_token,
        expiresIn: responseData.expires_in,
        error: responseData.error
      });

      if (!response.ok) {
        console.error('Token refresh failed:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });

        if (responseData.error === 'invalid_grant') {
          await invalidateAccount(account);
          throw new Error('AUTH_REQUIRED');
        }

        throw new Error(`Failed to refresh access token: ${responseData.error_description || responseData.error || 'Unknown error'}`);
      }
  
      if (!responseData.access_token) {
        console.error('No access token in response:', responseData);
        throw new Error('No access token returned');
      }

      console.log('Successfully refreshed token');

      // Prepare update data - only include fields that have valid values
      const updateData: any = {
        access_token: responseData.access_token,
        expires_at: Math.floor(Date.now() / 1000) + (responseData.expires_in || 3600),
      };

      // Only update refresh_token if we got a new one that's not null/undefined
      // Microsoft often doesn't return a new refresh token if the existing one is still valid
      if (responseData.refresh_token && responseData.refresh_token !== null) {
        updateData.refresh_token = responseData.refresh_token;
      }
  
      // Update the account in the database
      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        data: updateData,
      });
  
      return responseData.access_token;
    } catch (error) {
      console.error('Error in refreshAccessToken:', error);
      
      if (error instanceof Error && 
          (error.message.includes('invalid_grant') || 
           error.message.includes('invalid_refresh_token') ||
           error.message.includes('Refresh token expired'))) {
        await invalidateAccount(account);
        throw new Error('AUTH_REQUIRED');
      }
      
      throw error;
    }
  }

export default refreshAccessToken;