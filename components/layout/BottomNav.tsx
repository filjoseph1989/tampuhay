'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, PlusCircle, PieChart } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => {
    return pathname === path ? 'text-teal-600' : 'text-gray-500 hover:text-teal-500';
  };

  const isTreasurer = session?.user?.role === 'TREASURER';
  const canViewReports = isTreasurer || session?.user?.role === 'KABERK';

  return (
    <nav className="bg-white border-t border-gray-200 h-16 pb-safe w-full flex items-center justify-center">
      <div className="max-w-md md:max-w-4xl mx-auto w-full flex justify-around items-center h-full">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/')}`}>
          <Home size={24} />
          <span className="text-[10px] font-medium uppercase">Home</span>
        </Link>

        <Link href="/ledger" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/ledger')}`}>
          <BookOpen size={24} />
          <span className="text-[10px] font-medium uppercase">Ledger</span>
        </Link>

        {canViewReports && (
          <Link href="/breakdown" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/breakdown')}`}>
            <PieChart size={24} />
            <span className="text-[10px] font-medium uppercase">Report</span>
          </Link>
        )}

        {isTreasurer && (
          <Link href="/admin" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/admin')}`}>
            <PlusCircle size={24} />
            <span className="text-[10px] font-medium uppercase">Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
