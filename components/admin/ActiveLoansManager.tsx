'use client';

import React, { useState } from 'react';
import { useGroupStore } from '@/store/useGroupStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatMoney } from '@/lib/currency';
import { getMemberName } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ActiveLoansManager() {
  const { activeLoans, members, repayLoan } = useGroupStore();
  const [repayAmount, setRepayAmount] = useState<Record<string, string>>({});

  const activeLoansList = activeLoans.filter((l) => l.status === 'ACTIVE');

  const handleRepay = (loanId: number, memberName: string) => {
    const amount = parseFloat(repayAmount[loanId]);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const loan = activeLoansList.find(l => l.id === loanId);
    if (!loan) return;

    const member = members.find((m) => m.id === loan.memberId);
    const role = member?.role || 'MEMBER';
    const effectiveRate = (role === 'KABERK' || role === 'TREASURER')
      ? loan.interestRate
      : 10; // Todo: kaning 10 diri dapat dili ni hardcoded
    const interest = loan.principal * (effectiveRate / 100);
    const totalOwed = loan.principal + interest;
    const balance = totalOwed - loan.amountPaid;

    if (amount > balance + 0.01) { // small buffer for floating point
      if (!confirm(`Amount ${formatMoney(amount)} is more than the remaining balance ${formatMoney(balance)}. Continue?`)) {
        return;
      }
    }

    if (confirm(`Record payment of ${formatMoney(amount)} from ${memberName}?`)) {
      repayLoan(loanId, amount);
      setRepayAmount({ ...repayAmount, [loanId]: '' });
    }
  };

  if (activeLoansList.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>No active loans.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activeLoansList.map((loan) => {
        const member = members.find((m) => m.id === loan.memberId);
        const memberName = member?.name || 'Unknown';
        const role = member?.role || 'MEMBER';

        const effectiveRate = (role === 'KABERK' || role === 'TREASURER') ? loan.interestRate : 10;
        const interest = loan.principal * (effectiveRate / 100);
        const totalOwed = loan.principal + interest;
        const balance = totalOwed - loan.amountPaid;

        const isPastDue = new Date(loan.dueDate) < new Date();

        return (
          <Card key={loan.id} className="p-4 border-l-4 border-indigo-500">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-900">{memberName}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-tight">
                  {loan.type.replace('_', ' ')} LOAN
                </p>
              </div>
              {isPastDue && (
                <div className="flex items-center gap-1 text-red-600 text-[10px] font-bold uppercase">
                  <AlertCircle size={12} />
                  Past Due
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Balance</p>
                <p className="text-lg font-black text-indigo-700">{formatMoney(balance)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Due Date</p>
                <p className="text-xs font-medium text-gray-700">
                  {new Date(loan.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Repayment amount"
                  value={repayAmount[loan.id] || ''}
                  onChange={(e) => setRepayAmount({ ...repayAmount, [loan.id]: e.target.value })}
                />
              </div>
              <Button
                onClick={() => handleRepay(loan.id, memberName)}
                disabled={!repayAmount[loan.id]}
                className="bg-indigo-600 hover:bg-indigo-700">
                Repay
              </Button>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{ width: `${Math.min((loan.amountPaid / totalOwed) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 ml-3 whitespace-nowrap font-bold">
                {Math.round((loan.amountPaid / totalOwed) * 100)}% Paid
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
