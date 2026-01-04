import React from 'react';
import { Transaction, Member } from '../../types';
import { formatMoney } from '../../lib/currency';

interface TransactionFeedProps {
  transactions: Transaction[];
  members: Member[];
}

export default function TransactionFeed({ transactions, members }: TransactionFeedProps) {
  const getMemberName = (id: string) => {
    const member = members.find(m => m.id === id)
    return member ? member.name : "unknown member"
  }

  return (
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
  );
}
