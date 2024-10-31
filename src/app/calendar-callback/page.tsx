// app/calendar-callback/page.tsx
"use client"
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CalendarCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const provider = searchParams.get('provider');

      if (!code || !provider) {
        setError('Missing required parameters');
        return;
      }

      try {
        // Single API call to connect the calendar
        const response = await fetch('/api/calendar-accounts/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, provider }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Redirect back to calendar management
        router.push('/calendar-settings?success=true');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect account');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="mt-4 text-gray-600">Connecting your calendar account...</p>
    </div>
  );
}