'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useGroupStore } from '@/store/useGroupStore';
import { MobileShell } from '@/components/layout/MobileShell';
import TransactionFeed from '@/components/ledger/TransactionFeed';
import { Card } from '@/components/ui/Card';
import { formatMoney } from '@/lib/currency';
import { PiggyBank, Receipt, CreditCard } from 'lucide-react';

export default function MemberDetailPage() {
  const { id } = useParams();
  const { members, transactions, activeLoans } = useGroupStore();

  const member = useMemo(() => members.find((m) => m.id === id), [members, id]);
  
  const memberTransactions = useMemo(() => 
    transactions.filter((t) => t.memberId === id), 
  [transactions, id]);

  const memberLoans = useMemo(() => 
    activeLoans.filter((l) => l.memberId === id && l.status === 'ACTIVE'), 
  [activeLoans, id]);

  const totalLoanBalance = useMemo(() => 
    memberLoans.reduce((sum, l) => sum + (l.principal - l.amountPaid), 0), 
  [memberLoans]);

  if (!member) {
    return (
      <MobileShell title="Member Not Found">
        <div className="p-8 text-center">
          <p className="text-gray-500">The member you are looking for does not exist.</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell title={member.name}>
      <div className="p-4 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4 bg-teal-50 border-teal-100 flex items-center gap-4">
            <div className="bg-teal-600 p-3 rounded-xl text-white">
              <PiggyBank size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">Total Saved</p>
              <p className="text-2xl font-black text-teal-900">{formatMoney(member.totalSaved)}</p>
            </div>
          </Card>

          <Card className="p-4 bg-indigo-50 border-indigo-100 flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-xl text-white">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Active Loan Balance</p>
              <p className="text-2xl font-black text-indigo-900">{formatMoney(totalLoanBalance)}</p>
              {memberLoans.length > 0 && (
                <p className="text-[10px] text-indigo-400 mt-1 italic">
                  {memberLoans.length} active loan{memberLoans.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex items-center gap-2 mb-3 ml-1">
            <Receipt size={18} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight">Personal History</h3>
          </div>
          <TransactionFeed transactions={memberTransactions} members={members} />
        </div>
      </div>
    </MobileShell>
  );
}
