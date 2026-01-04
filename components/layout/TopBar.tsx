'use client'

import React from 'react';
import { User } from 'lucide-react';
import { useGroupStore } from '../../store/useGroupStore';

interface TopBarProps {
  userName?: string;
  groupName?: string;
}

export function TopBar({ groupName = 'Tampuhay Group' }: TopBarProps) {
  const { members } = useGroupStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-teal-600 text-white shadow-md h-14 flex items-center justify-between px-4">
      <div className="font-bold text-lg tracking-tight truncate max-w-[70%]">
        {groupName}
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium hidden sm:block">
          {members[0]?.name.split(' ').map(n => n[0]).join('').substring(0, 2) || 'TB'}
        </span>
        <div className="bg-teal-700 p-1.5 rounded-full">
          <User size={20} className="text-teal-100" />
        </div>
      </div>
    </header>
  );
}
