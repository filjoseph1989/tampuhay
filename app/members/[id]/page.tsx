'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroupStore } from '@/store/useGroupStore';
import TransactionFeed from '@/components/ledger/TransactionFeed';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatMoney } from '@/lib/currency';
import { PiggyBank, Receipt, CreditCard, Edit2, X, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function MemberDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { members, transactions, activeLoans, fetchData } = useGroupStore();
  const memberId = id ? parseInt(Array.isArray(id) ? id[0] : id) : 0;

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const member = useMemo(() => members.find((m) => m.id === memberId), [members, memberId]);
  
  const memberTransactions = useMemo(() => 
    transactions.filter((t) => t.memberId === memberId), 
  [transactions, memberId]);

  const memberLoans = useMemo(() => 
    activeLoans.filter((l) => l.memberId === memberId && l.status === 'ACTIVE'), 
  [activeLoans, memberId]);

  const allMemberLoans = useMemo(() => 
    activeLoans.filter((l) => l.memberId === memberId),
  [activeLoans, memberId]);

  const activeLoansList = useMemo(() => 
    activeLoans.filter((l) => l.memberId === memberId && l.status === 'ACTIVE'), 
  [activeLoans, memberId]);

  const totalLoanBalance = useMemo(() => {
    return activeLoansList.reduce((sum, l) => {
      const effectiveRate = (member?.role === 'KABERK' || member?.role === 'TREASURER') ? l.interestRate : 10;
      const interest = l.principal * (effectiveRate / 100);
      const totalOwed = l.principal + interest;
      return sum + (totalOwed - l.amountPaid);
    }, 0);
  }, [activeLoansList, member?.role]);

  const canEdit = session?.user?.id === memberId;

  const handleEditClick = () => {
    setNewName(member?.name || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/members/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        await fetchData(); // Refresh data
        router.refresh();  // Refresh server components/session if needed
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (!member) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">The member you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <Input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              className="flex-1"
              placeholder="Your Name"
            />
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Check size={16} />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>
              <X size={16} />
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-teal-800">{member.name}</h1>
            {canEdit && (
              <button 
                onClick={handleEditClick}
                className="text-gray-400 hover:text-teal-600 transition-colors">
                <Edit2 size={18} />
              </button>
            )}
          </>
        )}
      </div>

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
            {activeLoansList.length > 0 && (
              <p className="text-[10px] text-indigo-400 mt-1 italic">
                {activeLoansList.length} active loan{activeLoansList.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Loans Section */}
      {allMemberLoans.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1 ml-1">
            <CreditCard size={18} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight">Loan Breakdown</h3>
          </div>
          <div className="space-y-3">
            {allMemberLoans.map((loan) => {
              const effectiveRate = (member?.role === 'KABERK' || member?.role === 'TREASURER') ? loan.interestRate : 10;
              const interest = loan.principal * (effectiveRate / 100);
              const totalOwed = loan.principal + interest;
              const balance = totalOwed - loan.amountPaid;
              const percentPaid = Math.round((loan.amountPaid / totalOwed) * 100);
              return (
                <Card key={loan.id} className="p-4 border-l-4 border-teal-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {loan.type.replace('_', ' ')} ({effectiveRate}%)
                      </p>
                      <p className="text-lg font-black text-gray-900">{formatMoney(loan.principal)}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                      loan.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                      loan.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                  
                  {loan.status === 'ACTIVE' && (
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-gray-400">Balance: <span className="text-teal-600">{formatMoney(balance)}</span></span>
                        <span className="text-gray-400">{percentPaid}% Paid</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-full transition-all" style={{ width: `${Math.min(percentPaid, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400">Due: {new Date(loan.dueDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div>
        <div className="flex items-center gap-2 mb-3 ml-1">
          <Receipt size={18} className="text-gray-400" />
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight">Personal History</h3>
        </div>
        <TransactionFeed transactions={memberTransactions} members={members} />
      </div>
    </div>
  );
}
