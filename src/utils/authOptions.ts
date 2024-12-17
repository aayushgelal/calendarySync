import { AuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from "next-auth/providers/azure-ad"

const NextAuthOptions: AuthOptions= {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          params: {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events openid email profile',
          }
        }
      }),
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        authorization: {
          params: {
            scope: "openid email profile offline_access Mail.Send https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/Calendars.ReadWrite.Shared",
          },
        },
      }),
    ],
    callbacks: {
      async session({ session, user }:any) {
        if (user) {
          session.user.id = user.id;
          // Get the most recent account for this user
          const account = await prisma.account.findFirst({
            where: { userId: user.id },
          });
          
          if (account) {
            session.accessToken = account.access_token!;
            session.provider = account.provider;
          }
        }
        return session;
      },
    },
    events: {
      async signIn({ user, account }:any) {
        if (account && user) {
          // Update the access token in the database whenever the user signs in
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            data: {
              access_token: account.access_token,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
              email: user.email, 
            },
          });
        }
      },
    },
    pages: {
      signIn: '/login',
    },
    session: {
      strategy: 'database',
    },
    debug: process.env.NODE_ENV === 'development',
  }
  export {NextAuthOptions};
  