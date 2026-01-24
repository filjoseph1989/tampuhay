'use client'

import React from 'react';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface TopBarProps {
  userName?: string;
  groupName?: string;
}

export function TopBar({ groupName = 'Tampuhay Group' }: TopBarProps) {
  const { data: session } = useSession();

  const displayName = session?.user?.name
    ?.replace(/\(.*\)/, '')
    .trim()
    .toUpperCase();

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      signOut({ callbackUrl: '/login' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-teal-600 text-white shadow-md h-14 flex items-center justify-between px-4">
      <Link href="/" className="font-bold text-lg tracking-tight truncate max-w-[60%]">
        {groupName}
      </Link>

      {session?.user ? (
        <div className="flex items-center gap-3">
          <Link href={`/members/${session.user.id}`} className="flex items-center space-x-2 hover:bg-teal-700 p-1 rounded-lg transition-colors">
            <span className="text-sm font-medium hidden sm:block">
              {displayName}
            </span>
            <div className="bg-teal-700 p-1.5 rounded-full">
              <User size={20} className="text-teal-100" />
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-teal-700 rounded-lg transition-colors text-teal-100"
            title="Log Out">
            <LogOut size={20} />
          </button>
        </div>
      ) : (
        <Link href="/login" className="text-sm font-medium hover:text-teal-200">
          Login
        </Link>
      )}
    </header>
  );
}
