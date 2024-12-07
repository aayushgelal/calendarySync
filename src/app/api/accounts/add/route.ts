import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { NextAuthOptions } from '@/utils/authOptions';
export async function POST(req: Request) {
  const session = await getServerSession(NextAuthOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { provider, code } = await req.json()

  try {
    // Exchange the code for tokens
    const tokens = await exchangeCodeForTokens(provider, code)
    
    // Get user info from the provider
    const userInfo = await getUserInfo(provider, tokens.access_token)

    // Save as a sub-account
    const subAccount = await prisma.account.create({
      data: {
        userId: session.user.id,
        type: "oauth",
        provider,
        providerAccountId: userInfo.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
        scope: tokens.scope,
        email: userInfo.email,
        isSubAccount: true, // New field we'll add to the schema
      },
    })

    return NextResponse.json(subAccount)
  } catch (error) {
    console.error('Error adding sub-account:', error)
    return NextResponse.json({ error: "Failed to add account" }, { status: 500 })
  }
}

async function exchangeCodeForTokens(provider: string, code: string) {
  const tokenEndpoint = provider === 'google' 
    ? 'https://oauth2.googleapis.com/token'
    : 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

  const clientId = provider === 'google' 
    ? process.env.GOOGLE_CLIENT_ID 
    : process.env.AZURE_AD_CLIENT_ID
  const clientSecret = provider === 'google'
    ? process.env.GOOGLE_CLIENT_SECRET
    : process.env.AZURE_AD_CLIENT_SECRET

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/accounts/callback`,
      grant_type: 'authorization_code',
    }),
  })

  return response.json()
}

async function getUserInfo(provider: string, accessToken: string) {
  const userInfoEndpoint = provider === 'google'
    ? 'https://www.googleapis.com/oauth2/v2/userinfo'
    : 'https://graph.microsoft.com/v1.0/me'

  const response = await fetch(userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return response.json()
}