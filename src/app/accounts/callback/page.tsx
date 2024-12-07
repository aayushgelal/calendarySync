"use client"

import { useEffect } from "react"

export default function CallbackPage() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      window.opener.postMessage({ code }, window.location.origin)
      window.close()
    }
  }, [])

  return <div>Processing...</div>
}