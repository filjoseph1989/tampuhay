'use client'

import { useMemo } from 'react'
import { useGroupStore } from '../store/useGroupStore';
import HeroCard from '../components/dashboard/HeroCard';
import TransactionFeed from '../components/ledger/TransactionFeed';
import AddTransactionForm from '../components/admin/AddTransactionForm';

export default function Home() {
  const { groupState, members, transactions, addTransaction } = useGroupStore();

  /**
   * Para ni mag calculate pila nalang ka days
   * ang nabilin para mag payout
   */
  const daysUntilPayout = useMemo(() => {
      const target = new Date(groupState.targetPayoutDate);
      const today = new Date();
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }, [groupState.targetPayoutDate]);

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <h1 className="font-bold text-lg text-gray-800">Kaberks Tampuhay</h1>
        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
          {members[0]?.name.split(' ').map(n => n[0]).join('').substring(0, 2) || 'TB'}
        </div>
      </header>

      <div className="p-4 space-y-6">
        <HeroCard
          totalPot={groupState.totalPot}
          daysUntilPayout={daysUntilPayout} />
      </div>

      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          <button className="text-sm text-green-600 font-medium">View All</button>
        </div>

        <TransactionFeed
          transactions={transactions}
          members={members} />
      </div>

      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Treasurer Tools</h1>
        <AddTransactionForm
          members={members}
          addTransaction={addTransaction} />
      </div>
    </main>
  );
}