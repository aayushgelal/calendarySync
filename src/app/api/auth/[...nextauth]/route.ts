// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from "next-auth/providers/azure-ad";

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const NextAuthOptions:AuthOptions={
  
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          params: {
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events openid email profile',
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code'
          }
        }
      }),
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
       
        
        authorization: {
          params: {
            scope:
              "openid email profile Mail.Send https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/Calendars.ReadWrite.Shared ",
          },
        },
      }),
    ],
    callbacks: {
      async session({ session, user }) {
        session.user.id = user.id;
        return session;
      },
      async jwt({ token, account, profile }) {
        if (account) {
          token.accessToken = account.access_token;
          token.id = profile?.sub;
        }
        return token;
      }
    },
    pages: {
      signIn: '/login',
    },
    session: {
      strategy: 'database',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
    },
    debug: process.env.NODE_ENV === 'development',
  }


const handler = NextAuth(NextAuthOptions)

export { handler as GET, handler as POST }