import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { NextAuthOptions } from './api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(NextAuthOptions);
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Don't Double Book Me
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Sync your Google Calendars automatically and avoid double bookings.
            Just $20/year for unlimited calendar syncs.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/login"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get started
            </Link>
            <Link href="#features" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
