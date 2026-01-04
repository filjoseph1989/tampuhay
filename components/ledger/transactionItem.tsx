import React from 'react';
import { Transaction } from '../../types';
import { formatMoney } from '../../lib/currency';

interface TransactionItemProps {
  transaction: Transaction;
  memberName: string;
}

export default function TransactionItem({ transaction, memberName }: TransactionItemProps) {
  const { type, amount, date } = transaction;

  // Visual Logic based on Transaction Type
  let amountColor = 'text-gray-900';
  let sign = '';
  let iconBg = 'bg-gray-400';

  switch (type) {
    case 'CONTRIBUTION':
    case 'LOAN_PAYMENT':
      amountColor = 'text-green-600';
      sign = '+';
      iconBg = type === 'CONTRIBUTION' ? 'bg-blue-500' : 'bg-purple-500';
      break;
    case 'FINE':
      amountColor = 'text-orange-600';
      sign = '+';
      iconBg = 'bg-orange-500';
      break;
    case 'LOAN_DISBURSEMENT':
    case 'EXPENSE':
      amountColor = 'text-red-600';
      sign = '-';
      iconBg = type === 'EXPENSE' ? 'bg-red-500' : 'bg-purple-500';
      break;
  }

  return (
    <li className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${iconBg}`}>
          {memberName.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{memberName}</p>
          <div className="text-xs text-gray-500 capitalize">
            <p>{type.replace('_', ' ').toLowerCase()}</p>
            <p suppressHydrationWarning>{new Date(date).toLocaleString()}</p>
          </div>
        </div>
      </div>
      <span className={`font-bold text-sm ${amountColor}`}>
        {sign}{formatMoney(amount)}
      </span>
    </li>
  );
}
