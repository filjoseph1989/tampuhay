import React from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

interface MobileShellProps {
  children: React.ReactNode;
  userName?: string;
  groupName?: string;
}

export function MobileShell({ children, groupName }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16 font-sans">
      {/*
        pt-16: Padding Top to account for fixed TopBar (h-14 + gap)
        pb-20: Padding Bottom to account for fixed BottomNav (h-16 + gap)
      */}

      <TopBar
        groupName={groupName} />

      <main className="px-4 max-w-md mx-auto w-full">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
