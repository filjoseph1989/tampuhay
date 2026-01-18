import { useGroupStore } from '../../store/useGroupStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatMoney } from '../../lib/currency';

export default function CycleManagement() {
  const members = useGroupStore((state) => state.members);
  const transactions = useGroupStore((state) => state.transactions);
  const activeLoans = useGroupStore((state) => state.activeLoans);
  const convertToAutoLoan = useGroupStore((state) => state.convertToAutoLoan);
  const rolloverLoan = useGroupStore((state) => state.rolloverLoan);
  const SHARE_VALUE = 1000;

  // --- LOGIC 1: UNPAID SHARE CAPITAL ---
  const getMissingContribution = (memberId: string, numberOfShares: number) => {
    const requiredAmount = numberOfShares * SHARE_VALUE;
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

  // --- LOGIC 2: PAST DUE LOANS ---
  const pastDueLoans = activeLoans.filter((loan) => {
    if (loan.status !== 'ACTIVE') return false;
    const dueDate = new Date(loan.dueDate);
    const now = new Date();
    return dueDate < now;
  });

  const handleRollover = (loanId: string, currentPrincipal: number, memberName: string) => {
    const newPrincipal = currentPrincipal + (currentPrincipal * 0.05);
    if (confirm(`Rollover Loan for ${memberName}?\n\nCurrent Principal: ${formatMoney(currentPrincipal)}\nNew Principal (+5%): ${formatMoney(newPrincipal)}\n\nThis will mark the old loan as Paid and create a new one.`)) {
      rolloverLoan(loanId);
    }
  };

  if (delinquentMembers.length === 0 && pastDueLoans.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>All clear! No unpaid shares or past-due loans. 🎉</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-6">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-bold text-gray-800">Cycle Management</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {new Date().getFullYear()} Cycle
        </span>
      </div>
      {/* SECTION 1: UNPAID SHARE CAPITAL */}
      {delinquentMembers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unpaid Share Capital</h4>
          <p className="text-sm text-gray-600">Convert unpaid dues to Auto-Loans (5% Interest).</p>
          <div className="space-y-3">
            {delinquentMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-100">
                <div>
                  <p className="font-bold text-gray-800">{member.name}</p>
                  <div className="text-xs text-gray-500">
                    Shares: {member.numberOfShares} (Target: {formatMoney(member.numberOfShares * SHARE_VALUE)})
                  </div>
                  <p className="text-xs text-red-500 font-semibold">Missing: {formatMoney(member.missingAmount)}</p>
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
        </div>
      )}
      {/* SECTION 2: PAST DUE LOANS */}
      {pastDueLoans.length > 0 && (
        <div className="space-y-3">
          <div className="border-t pt-4">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">⚠️ Past Due Loans</h4>
          </div>
          <p className="text-sm text-gray-600">Loans that have exceeded their due date. Rollover to add penalty.</p>
          <div className="space-y-3">
            {pastDueLoans.map((loan) => {
              const member = members.find(m => m.id === loan.memberId);
              return (
                <div key={loan.id} className="flex items-center justify-between bg-red-50 p-3 rounded border border-red-100">
                  <div>
                    <p className="font-bold text-gray-800">{member?.name || 'Unknown Member'}</p>
                    <div className="text-xs text-gray-500">Due: {new Date(loan.dueDate).toLocaleDateString()}</div>
                    <p className="text-xs text-red-600 font-semibold">Principal: {formatMoney(loan.principal)}</p>
                  </div>
                  <Button
                    variant="danger"
                    className="py-1 px-3 text-xs"
                    onClick={() => handleRollover(loan.id, loan.principal, member?.name || '')}>
                    Rollover
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}