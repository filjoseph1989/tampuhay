'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, PlusCircle } from 'lucide-react';
import { useGroupStore } from '../../store/useGroupStore';

export default function BottomNav() {
  const pathname = usePathname();
  const { members } = useGroupStore();

  // MOCK AUTH: Assume the logged-in user is the first one (Tita Baby)
  // In a real app, this would come from an auth session
  const currentUser = members[0];
  const isTreasurer = currentUser?.role === 'TREASURER';

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Ledger', href: '/ledger', icon: BookOpen },
  ];

  // Only show Admin tab if user is Treasurer
  if (isTreasurer) {
    navItems.push({ label: 'Admin', href: '/admin', icon: PlusCircle });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium uppercase tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}