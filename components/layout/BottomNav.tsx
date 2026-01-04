'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, PlusCircle } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'text-teal-600' : 'text-gray-500 hover:text-teal-500';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 h-16 pb-safe">
      <div className="flex justify-around items-center h-full">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/')}`}>
          <Home size={24} />
          <span className="text-[10px] font-medium uppercase">Home</span>
        </Link>

        <Link href="/ledger" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/ledger')}`}>
          <BookOpen size={24} />
          <span className="text-[10px] font-medium uppercase">Ledger</span>
        </Link>

        <Link href="/admin" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/admin')}`}>
          <PlusCircle size={24} />
          <span className="text-[10px] font-medium uppercase">Admin</span>
        </Link>
      </div>
    </nav>
  );
}
