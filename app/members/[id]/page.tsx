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

  const totalLoanBalance = useMemo(() => 
    memberLoans.reduce((sum, l) => sum + (l.principal - l.amountPaid), 0), 
  [memberLoans]);

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
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
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
  );
}
