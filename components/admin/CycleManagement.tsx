import { useState } from 'react';
import { useGroupStore } from '../../store/useGroupStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatMoney } from '../../lib/currency';

export default function CycleManagement() {
  const members = useGroupStore((state) => state.members);
  const transactions = useGroupStore((state) => state.transactions);
  const convertToAutoLoan = useGroupStore((state) => state.convertToAutoLoan);

  const [contributionAmount] = useState(5000); // Default per Page 14 scenario
  const [interestRate] = useState(10); // 10% penalty rate per Page 14

  // Helper to check if a member has contributed this month
  const hasContributedThisMonth = (memberId: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.some((t) => {
      const tDate = new Date(t.date);
      return (
        t.memberId === memberId &&
        t.type === 'CONTRIBUTION' &&
        t.date.indexOf('AUTO_CONTRIBUTION') === -1 && // Ensure it's a real contribution? No, simplified check for now.
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    });
  };

  const delinquentMembers = members.filter((m) => !hasContributedThisMonth(m.id));

  const handleConvert = (memberId: string) => {
    if (confirm(`Convert ${contributionAmount} for this member to an Auto-Loan?`)) {
      convertToAutoLoan(memberId, contributionAmount, interestRate);
    }
  };

  if (delinquentMembers.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>All members have contributed for this month! 🎉</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-bold text-gray-800">Cycle Management</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <p className="text-sm text-gray-600">
        The following members have not contributed yet. Convert unpaid dues to Auto-Loans.
      </p>

      <div className="space-y-3">
        {delinquentMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-100">
            <div>
              <p className="font-bold text-gray-800">{member.name}</p>
              <p className="text-xs text-red-500">Missing: {formatMoney(contributionAmount)}</p>
            </div>
            <Button
              variant="danger"
              className="py-1 px-3 text-xs"
              onClick={() => handleConvert(member.id)}>
              Auto-Loan
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
