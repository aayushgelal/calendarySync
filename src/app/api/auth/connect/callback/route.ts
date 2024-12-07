import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { NextAuthOptions } from "../../[...nextauth]/route"
import { stat } from "fs"

async function exchangeGoogleToken(code: string) {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token'
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/connect/callback`,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to exchange Google token: ${await response.text()}`)
  }

  return response.json()
}

async function exchangeMicrosoftToken(code: string) {
  const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.AZURE_AD_CLIENT_ID!,
      client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/connect/callback`,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to exchange Microsoft token: ${await response.text()}`)
  }

  return response.json()
}

async function getGoogleUserInfo(access_token: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!response.ok) {
    throw new Error('Failed to get Google user info')
  }

  return response.json()
}

async function getMicrosoftUserInfo(access_token: string) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!response.ok) {
    throw new Error('Failed to get Microsoft user info')
  }

  return response.json()
}

export async function GET(request: Request) {
  try {
    // Get current session
    const session = await getServerSession(NextAuthOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get code and provider from URL parameters
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const provider = searchParams.get('provider') || state // provider might be in state parameter
    console.log(code, provider,state)
    if (!code || !provider) {
      return new Response("Missing code or provider", { status: 400 })
    }

    // Exchange code for tokens based on provider
    let tokens, userInfo, providerAccountId, email

    if (provider.includes('google')) {
      tokens = await exchangeGoogleToken(code)
      userInfo = await getGoogleUserInfo(tokens.access_token)
      providerAccountId = userInfo.id
      email = userInfo.email
    } else if (provider.includes('azure') || provider.includes('microsoft')) {
      tokens = await exchangeMicrosoftToken(code)
      userInfo = await getMicrosoftUserInfo(tokens.access_token)
      providerAccountId = userInfo.id
      email = userInfo.mail || userInfo.userPrincipalName
    } else {
      return new Response("Invalid provider", { status: 400 })
    }

    // Check if this account is already connected
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: provider,
          providerAccountId: providerAccountId,
        },
      },
    })

    if (existingAccount) {
      // Update existing account
      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: provider,
            providerAccountId: providerAccountId,
          },
        },
        data: {
          access_token: tokens.access_token,
          expires_at: tokens.expires_in 
            ? Math.floor(Date.now() / 1000 + tokens.expires_in)
            : null,
          refresh_token: tokens.refresh_token,
        },
      })
    } else {
      // Create new sub-account
      await prisma.account.create({
        data: {
          userId: session.user.id,
          type: "oauth",
          provider: provider,
          providerAccountId: providerAccountId,
          access_token: tokens.access_token,
          expires_at: tokens.expires_in 
            ? Math.floor(Date.now() / 1000 + tokens.expires_in)
            : null,
          refresh_token: tokens.refresh_token,
          token_type: tokens.token_type,
          scope: tokens.scope,
          email: email,
          isSubAccount: true,
        },
      })
    }
    console.log(request.url)
    // Redirect back to dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard?success=true', process.env.NEXTAUTH_URL)
    )

  } catch (error) {
    console.error('Error in connect callback:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=true', request.url)
    )
  }
}