import React from 'react';
import { Transaction, Member } from '../../types';
import { getMemberName } from '../../lib/utils';
import TransactionItem from './transactionItem';

interface TransactionFeedProps {
  transactions: Transaction[];
  members: Member[];
}

export default function TransactionFeed({ transactions, members }: TransactionFeedProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {transactions.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">
          No transactions yet.
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {transactions.map((tx) => {
            return (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                memberName={getMemberName(members, tx.memberId)} />
            )
          })}
        </ul>
      )}
    </div>
  );
}
