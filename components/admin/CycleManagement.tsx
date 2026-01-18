import { useGroupStore } from '../../store/useGroupStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatMoney } from '../../lib/currency';

export default function CycleManagement() {
  const members = useGroupStore((state) => state.members);
  const transactions = useGroupStore((state) => state.transactions);
  const convertToAutoLoan = useGroupStore((state) => state.convertToAutoLoan);

  const SHARE_VALUE = 1000;

  // Helper to check if a member has fully paid their share capital
  const getMissingContribution = (memberId: string, numberOfShares: number) => {
    const requiredAmount = numberOfShares * SHARE_VALUE;

    // Sum all contributions made by this member
    const totalContributed = transactions
      .filter((t) => t.memberId === memberId && t.type === 'CONTRIBUTION')
      .reduce((sum, t) => sum + t.amount, 0);

    return requiredAmount - totalContributed;
  };

  const delinquentMembers = members
    .map((member) => ({
      ...member,
      missingAmount: getMissingContribution(member.id, member.numberOfShares || 0),
    }))
    .filter((m) => m.missingAmount > 0);

  const handleConvert = (memberId: string, amount: number) => {
    if (confirm(`Convert ${formatMoney(amount)} (Unpaid Share Capital) for this member to an Auto-Loan?`)) {
      convertToAutoLoan(memberId, amount);
    }
  };

  if (delinquentMembers.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>All members have settled their Share Capital! 🎉</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-bold text-gray-800">Share Capital Management</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {new Date().getFullYear()} Cycle
        </span>
      </div>

      <p className="text-sm text-gray-600">
        The following members have unpaid Share Capital. Convert dues to Auto-Loans (5% Interest).
      </p>

      <div className="space-y-3">
        {delinquentMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-100">
            <div>
              <p className="font-bold text-gray-800">{member.name}</p>
              <div className="text-xs text-gray-500">
                Shares: {member.numberOfShares} (Target: {formatMoney(member.numberOfShares * SHARE_VALUE)})
              </div>
              <p className="text-xs text-red-500 font-semibold">
                Missing: {formatMoney(member.missingAmount)}
              </p>
            </div>
            <Button
              variant="danger"
              className="py-1 px-3 text-xs"
              onClick={() => handleConvert(member.id, member.missingAmount)}>
              Auto-Loan
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}