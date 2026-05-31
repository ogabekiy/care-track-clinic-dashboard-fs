'use client'

import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

export function TopBar() {
  const { user } = useAuth()


const defaultAvatars = {
  doctor:
    "https://png.pngtree.com/png-clipart/20250104/original/pngtree-female-doctor-avatar-vector-design-png-image_9828008.png",

  admin:
    "https://img.icons8.com/3d-fluency/1200/administrator-male--v2.jpg",

  staff:
    "https://png.pngtree.com/png-vector/20220901/ourmid/pngtree-company-employee-avatar-icon-wearing-a-suit-png-image_6133899.png",
};

  return (
    <div className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-6">
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-foreground">
          Welcome back, {user?.first_name.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
         <Image
  className="rounded-full object-cover"
  src={
    user?.avatar?.trim() ||
    defaultAvatars[user?.role as keyof typeof defaultAvatars] ||
    defaultAvatars.staff
  }
  alt="User avatar"
  width={40}
  height={40}
/>
        </div>
      </div>
    </div>
  )
}
