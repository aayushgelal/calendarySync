"use client"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, PlusCircle, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'

interface DashboardDrawerProps {
  session: Session | null
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
]

const getInitials = (name?: string | null) => {
  if (!name) return '??'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function DashboardDrawer({ session }: DashboardDrawerProps) {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <Image 
            src="/logo.png" 
            alt="SyncMyCal" 
            className="object-contain" 
            width={160} 
            height={40} 
            priority
          />
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    className="w-full justify-start gap-3 hover:bg-gray-100/80"
                  >
                    {item.icon}
                    {item.title}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-white shadow-sm">
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
  )
}