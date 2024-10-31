// src/app/dashboard/page.tsx

import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import CalendarSync from '@/components/CalendarSync';
import { ActiveSyncs } from '@/components/ActiveSyncs';
import { NextAuthOptions } from '../api/auth/[...nextauth]/route';
import Provider from '@/components/Provider';

export default async function DashboardPage() {
  const session = await getServerSession(NextAuthOptions);
  
  if (!session) {
    redirect('/login');
  }

  const activeSyncs = await prisma.calendarSync.findMany({
    where: {
      userId: session.user.id
    }
  });

  return (
    <Provider>

    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <ActiveSyncs syncs={activeSyncs} />
          <CalendarSync />
        </div>
      </main>
    </div>
    </Provider>

  );
}