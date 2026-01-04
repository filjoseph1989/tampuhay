'use client'

import { useMemo, useState } from 'react'
import { useGroupStore } from '../store/useGroupStore';
import { TransactionType } from '../types';
import HeroCard from '../components/dashboard/HeroCard';
import TransactionFeed from '../components/ledger/TransactionFeed';

export default function Home() {
  const { groupState, members, transactions, addTransaction } = useGroupStore();
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    type: 'CONTRIBUTION' as TransactionType,
    date: new Date().toISOString().split('T')[0], // Default to YYYY-MM-DD
  });

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

  /**
   * Para ni mag record sa transaction
   * @param e
   * @returns
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.memberId || !formData.amount) return;
    addTransaction({
      memberId: formData.memberId,
      amount: parseFloat(formData.amount),
      type: formData.type,
      date: new Date(formData.date).toISOString(),
    });
    alert("Transaction successfully recorded!");
    setFormData({
      ...formData,
      amount: '',
      memberId: '',
      type: 'CONTRIBUTION',
      date: new Date().toISOString().split('T')[0]
    });
  }

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
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h1 className="text-lg font-semibold mb-4 text-gray-700">Add Transaction</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Member</label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.memberId}
                onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                required>
                <option value="">Select a member...</option>
                {members.map((m) => {
                  return (<option key={m.id} value={m.id}>{m.name}</option>)
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as TransactionType})}
                required>
                <option value="CONTRIBUTION">Contribution (Hulog)</option>
                <option value="FINE">Fine (Penalty)</option>
                <option value="LOAN_PAYMENT">Loan Payment</option>
                <option value="LOAN_DISBURSEMENT">Loan Disbursement (Out)</option>
                <option value="EXPENSE">Expense (Out)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₱)</label>
              <input
                type="number"
                className="w-full p-3 text-lg font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-colors mt-4">
              Confirm Transaction
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}