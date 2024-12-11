import React from 'react';
import { DashboardDrawer } from '@/components/final/DashboardDrawer'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { NextAuthOptions } from '@/utils/authOptions'
import { Toaster } from 'react-hot-toast';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(NextAuthOptions)

  if (!session) {
    redirect('/')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardDrawer session={session} />
      <Toaster />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}