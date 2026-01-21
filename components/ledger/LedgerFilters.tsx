import React from 'react';
import { Member, TransactionType } from '../../types';

interface LedgerFiltersProps {
  members: Member[];
  selectedMemberId: string;
  onMemberChange: (id: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const TRANSACTION_TYPES: { label: string; value: TransactionType | '' }[] = [
  { label: 'All Types', value: '' },
  { label: 'Contribution', value: 'CONTRIBUTION' },
  { label: 'Loan Payment', value: 'LOAN_PAYMENT' },
  { label: 'Loan Disbursement', value: 'LOAN_DISBURSEMENT' },
  { label: 'Fine', value: 'FINE' },
  { label: 'Expense', value: 'EXPENSE' },
  { label: 'Interest Earned', value: 'INTEREST_EARNED' },
  { label: 'Loan Rollover', value: 'LOAN_ROLLOVER' },
];

export default function LedgerFilters({
  members,
  selectedMemberId,
  onMemberChange,
  selectedType,
  onTypeChange,
}: LedgerFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label htmlFor="member-filter" className="block text-xs font-medium text-gray-500 mb-1 ml-1">
          Filter by Member
        </label>
        <select
          id="member-filter"
          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedMemberId}
          onChange={(e) => onMemberChange(e.target.value)}>
          <option value="">All Members</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor="type-filter" className="block text-xs font-medium text-gray-500 mb-1 ml-1">
          Filter by Type
        </label>
        <select
          id="type-filter"
          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}>
          {TRANSACTION_TYPES.map((type) => (
            <option key={type.label} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
