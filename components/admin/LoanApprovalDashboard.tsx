import { useGroupStore } from "@/store/useGroupStore";
import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/currency";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function LoanApprovalDashboard() {
  const activeLoans = useGroupStore((state) => state.activeLoans);
  const members = useGroupStore((state) => state.members);
  const pendingLoans = activeLoans.filter((l) => l.status === 'PENDING');
  console.log('pending loans', pendingLoans);

  const getMemberName = (memberId: string) => {
    const name = members.find((m) => m.id === memberId)?.name || 'Unknown';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      default:
        return 'neutral';
    }
  }

  const getRiskLevel = (memberId: string, principal: number) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return 'Unknown';

    const ratio = member.totalSaved / principal;
    if (ratio >= 1) return 'LOW';
    if (ratio >= 0.5) return 'MEDIUM';

    return 'HIGH';
  }

  if (pendingLoans.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>No pending loan requests.</p>
      </Card>
    )
  }

  return (
    <div>
      {pendingLoans.map((loan) => {
        const risk = getRiskLevel(loan.memberId, loan.principal);

        return (
          <Card key={loan.id} className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3>{getMemberName(loan.memberId)}</h3>
                <p>Requested: {formatMoney(loan.principal)}</p>
              </div>
              <Badge variant={getRiskColor(risk)}>
                Risk: {risk}
              </Badge>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="danger"
                fullWidth className="bg-green-600 hover:bg-green-700 cursor-pointer">
                Reject
              </Button>
              <Button fullWidth
                className="bg-green-600 hover:bg-green-700 cursor-pointer">
                Approve
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  );
}