import React, { useState } from 'react';
import { Member, TransactionType } from '../../types';

interface AddTransactionFormProps {
  members: Member[];
  addTransaction: (transaction: {
    memberId: string;
    amount: number;
    type: TransactionType;
    date: string;
  }) => void;
}

export default function AddTransactionForm({ members, addTransaction }: AddTransactionFormProps) {
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    type: 'CONTRIBUTION' as TransactionType,
    date: new Date().toISOString().split('T')[0], // Default to YYYY-MM-DD
  });

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
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h1 className="text-lg font-semibold mb-4 text-gray-700">Add Transaction</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Member</label>
          <select
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={formData.memberId}
            onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
            required>
            <option value="">Select a member...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
          <select
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
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
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
  );
}
