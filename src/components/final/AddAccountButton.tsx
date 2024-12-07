"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export const AddAccountButton: React.FC<{
  provider: "google" | "azure-ad"
}> = ({ provider }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleAddAccount = () => {
    setIsLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_NEXTAUTH_URL
      const redirectUri = `${baseUrl}/api/auth/connect/callback`

      const params = new URLSearchParams({
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        redirect_uri: redirectUri,
        state: provider, // Include provider in state parameter
      })
      console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID)

      if (provider === 'google') {
        params.append('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!)
        params.append('scope', 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events openid email profile')
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      } else {
        params.append('client_id', process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!)
        params.append('scope', 'openid email profile offline_access Calendars.ReadWrite')
        window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
      }
    } catch (error) {
      console.error('Error initiating account connection:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleAddAccount}
      variant="outline"
      disabled={isLoading}
    >
      {isLoading ? "Connecting..." : `Connect ${provider === "azure-ad" ? "Microsoft" : "Google"} Account`}
    </Button>
  )
}