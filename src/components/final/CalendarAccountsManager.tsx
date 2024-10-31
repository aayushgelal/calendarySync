// src/app/connect-calendar/page.tsx
'use client';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ConnectCalendarPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleConnectGoogle = () => {
    signIn('google', {
      callbackUrl: '/dashboard', // Redirect after connection
    });
  };

  const handleConnectAzure = () => {
    signIn('azure-ad', {
      callbackUrl: '/dashboard', // Redirect after connection
    });
  };

  if (!session) return <p>Loading...</p>;

  return (
    <div>
      <h2>Connect Your Calendar</h2>
      <button onClick={handleConnectGoogle}>Connect Google Calendar</button>
      <button onClick={handleConnectAzure}>Connect Microsoft Calendar</button>
      <h3>Connected Accounts</h3>
      {session.user.accounts.length === 0 ? (
        <p>No accounts connected.</p>
      ) : (
        <ul>
          {session.user.accounts.map((account) => (
            <li key={`${account.provider}-${account.providerAccountId}`}>
              {account.provider} ({account.providerAccountId}) - Connected
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
