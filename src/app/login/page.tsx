import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { LoginButton } from '@/components/LoginButton';
import { NextAuthOptions } from '../api/auth/[...nextauth]/route';

export default async function LoginPage() {
  const session = await getServerSession(NextAuthOptions);
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Don't Double Book Me
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sync your calendars seamlessly for just $20/year
          </p>
        </div>
        <div className="mt-8">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}