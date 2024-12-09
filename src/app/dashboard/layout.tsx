"use client"
import React from 'react';
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, PlusCircle, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useSession,signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Toaster } from 'react-hot-toast';
import Image from 'next/image';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const getInitials = (name?: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  if(!session) {
    redirect('/')
  }


  const menuItems = [
    {
      title: 'Active Syncs',
      icon: <CalendarDays className="h-5 w-5" />,
      href: '/dashboard/syncs'
    },
    {
      title: 'Connected Accounts',
      icon: <Users className="h-5 w-5" />,
      href: '/dashboard/accounts'
    },
    {
      title: 'Create New Sync',
      icon: <PlusCircle className="h-5 w-5" />,
      href: '/dashboard/new-sync'
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/dashboard/settings'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster />
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-4 border-b border-gray-200 object-fill">
            <Image src="/logo.png" alt="SyncMyCal" className="object-fill" width={200} height={10} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant={pathname === item.href ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                    >
                      {item.icon}
                      {item.title}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

     
 {/* User Profile Section */}
 <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={session?.user?.image ?? ''} />
                <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session?.user?.name || 'Unknown User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email || 'No email'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="text-gray-500 hover:text-gray-700"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
      </div>
    </div>
        
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
  </div>
  );
};

export default DashboardLayout;