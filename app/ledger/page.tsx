'use client';

import React, { useState, useMemo } from 'react';
import { useGroupStore } from '@/store/useGroupStore';
import TransactionFeed from '@/components/ledger/TransactionFeed';
import LedgerFilters from '@/components/ledger/LedgerFilters';
import { Button } from '@/components/ui/Button';
import { getMemberName } from '@/lib/utils';

export default function LedgerPage() {
  const { transactions, members } = useGroupStore();
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesMember = selectedMemberId ? tx.memberId === selectedMemberId : true;
      const matchesType = selectedType ? tx.type === selectedType : true;
      return matchesMember && matchesType;
    });
  }, [transactions, selectedMemberId, selectedType]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['Date', 'Member', 'Type', 'Amount'];
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.date).toLocaleString(),
      getMemberName(members, tx.memberId),
      tx.type,
      tx.amount.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')), // Corrected: escaped quotes within template literal
    ].join('\n'); // Corrected: escaped newline character for string literal

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={filteredTransactions.length === 0}>
          Export CSV
        </Button>
      </div>

      <LedgerFilters
        members={members}
        selectedMemberId={selectedMemberId}
        onMemberChange={setSelectedMemberId}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      <div className="mt-4">
        <TransactionFeed
          transactions={filteredTransactions}
          members={members}
        />
      </div>
    </div>
  );
}
