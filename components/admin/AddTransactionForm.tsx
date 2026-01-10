import React, { useState } from 'react';
import { Member, TransactionType } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

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

    setFormData({
      ...formData,
      amount: '',
      memberId: '',
      type: 'CONTRIBUTION',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Card>
      <h3 className="text-lg font-bold mb-4 text-gray-700">Add Transaction</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          as="select"
          label="Member"
          value={formData.memberId}
          onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
          required>
          <option value="">Select a member...</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </Input>

        <Input
          as="select"
          label="Type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
          required>
          <option value="CONTRIBUTION">Contribution (Hulog)</option>
          <option value="FINE">Fine (Penalty)</option>
          <option value="LOAN_PAYMENT">Loan Payment</option>
          <option value="LOAN_DISBURSEMENT">Loan Disbursement (Out)</option>
          <option value="EXPENSE">Expense (Out)</option>
        </Input>

        <Input
          type="number"
          label="Amount (₱)"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
          min="1"
        />

        <Input
          type="date"
          label="Date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <Button type="submit" fullWidth className="mt-4 cursor-pointer">
          Confirm Transaction
        </Button>
      </form>
    </Card>
  );
}
