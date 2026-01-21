'use client'

import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useGroupStore } from '../../store/useGroupStore';

interface TopBarProps {
  userName?: string;
  groupName?: string;
}

export function TopBar({ groupName = 'Tampuhay Group' }: TopBarProps) {
  const { members } = useGroupStore();

  const treasurer = members[0];
  const displayName = treasurer?.name
    .replace(/\(.*\)/, '')
    .trim()
    .toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-teal-600 text-white shadow-md h-14 flex items-center justify-between px-4">
      <Link href="/" className="font-bold text-lg tracking-tight truncate max-w-[70%]">
        {groupName}
      </Link>

      <Link href={`/members/${treasurer?.id || '1'}`} className="flex items-center space-x-2 hover:bg-teal-700 p-1 rounded-lg transition-colors">
        <span className="text-sm font-medium hidden sm:block">
          {displayName || 'Guest'}
        </span>
        <div className="bg-teal-700 p-1.5 rounded-full">
          <User size={20} className="text-teal-100" />
        </div>
      </Link>
    </header>
  );
}
