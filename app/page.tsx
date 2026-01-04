'use client'

import { useMemo } from 'react'
import { useGroupStore } from '../store/useGroupStore';

export default function Home() {
  const { groupState, members, transactions } = useGroupStore();

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  }

  const getMemberName = (id: string) => {
    const member = members.find(m => m.id === id)
    return member ? member.name : "unknown member"
  }

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
        <div className="bg-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-200">
          <p className="text-green-100 text-sm font-medium mb-1">Total Group Saving</p>
          <h2 className="text-4xl font-bold  mb-4 tracking-tight">
            {formatMoney(groupState.totalPot)}
          </h2>

          <div className="flex items-center justify-between bg-green-700/40 rounded-lg p-3 backdrop-blur-sm">
            <span className="text-sm text-green-50 font-medium">Days until payout</span>
            <span className="font-bold text-white">{daysUntilPayout} Days</span>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          <button className="text-sm text-green-600 font-medium">View All</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              No transactions yet.
            </div>
          ) : (
              <ul className="divide-y divide-gray-50">
                {transactions.map((tx) => {
                  const isPositive = ['CONTRIBUTION', 'FINE', 'LOAN_PAYMENT'].includes(tx.type);

                  return (
                    <li key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm
                          ${tx.type === 'CONTRIBUTION' ? 'bg-blue-500' :
                            tx.type === 'FINE' ? 'bg-orange-500' :
                            tx.type === 'EXPENSE' ? 'bg-red-500' : 'bg-purple-500'}`}>
                            {getMemberName(tx.memberId).charAt(0)}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{getMemberName(tx.memberId)}</p>
                          <div className="text-xs text-gray-500 capitalize">
                            <p> {tx.type.replace('_', ' ').toLowerCase()} </p>
                            <p suppressHydrationWarning> {new Date(tx.date).toLocaleString()} </p>
                          </div>
                        </div>
                      </div>

                      <span className={`font-bold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : '-'}{formatMoney(tx.amount)}
                      </span>
                    </li>
                  )
                })}
              </ul>
          )}
        </div>
      </div>
    </main>
  );
}