'use client';

import React, { useEffect } from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { useGroupStore } from '@/store/useGroupStore';

import { useSession } from 'next-auth/react';

interface MobileShellProps {
  children: React.ReactNode;
  userName?: string;
  groupName?: string;
}

export function MobileShell({ children, groupName }: MobileShellProps) {
  const fetchData = useGroupStore((state) => state.fetchData);
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [fetchData, status]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16 font-sans">
      {/*
        pt-16: Padding Top to account for fixed TopBar (h-14 + gap)
        pb-20: Padding Bottom to account for fixed BottomNav (h-16 + gap)
      */}

      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="w-full pointer-events-auto">
          <TopBar groupName={groupName} />
        </div>
      </div>

      <main className="px-4 max-w-md md:max-w-4xl mx-auto w-full">
        {children}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="w-full pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
