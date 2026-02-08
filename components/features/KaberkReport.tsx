'use client';

import { useGroupStore } from '../../store/useGroupStore';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatMoney } from '../../lib/currency';

export default function KaberkReport() {
  const { groupState, activeLoans, members } = useGroupStore();

  // Filter only truly active loans (just in case the store has others)
  const loansInCirculation = activeLoans.filter((loan) => loan.status === 'ACTIVE');

  // Calculate total money currently lent out
  const totalLentOut = loansInCirculation.reduce((sum, loan) => {
    const interest = loan.principal * (loan.interestRate / 100);
    return sum + (loan.principal + interest - loan.amountPaid);
  }, 0);

  return (
    <div className="space-y-6">
      {/* 1. Pot Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-teal-600">
          <p className="text-sm font-medium opacity-90 uppercase tracking-wider">Available Cash (Pot)</p>
          <p className="text-4xl font-black mt-2">{formatMoney(groupState.totalPot)}</p>
          <p className="text-xs mt-2 opacity-75">Ready for disbursement</p>
        </Card>

        <Card className="p-6 bg-indigo-600">
          <p className="text-sm font-medium opacity-90 uppercase tracking-wider">Money in Circulation</p>
          <p className="text-4xl font-black mt-2">{formatMoney(totalLentOut)}</p>
          <p className="text-xs mt-2 opacity-75">Currently with members</p>
        </Card>
      </div>

      {/* 2. Active Loans List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-gray-800">Active Loans</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {loansInCirculation.length} Active
          </span>
        </div>

        {loansInCirculation.length === 0 ? (
          <Card className="p-8 text-center text-gray-500 bg-gray-50 border-dashed border-2 border-gray-200">
            <p>No active loans. All funds are in the pot.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {loansInCirculation.map((loan) => {
              const member = members.find((m) => m.id === loan.memberId);
              const interest = loan.principal * (loan.interestRate / 100);
              const remaining = (loan.principal + interest) - loan.amountPaid;
              const isPastDue = new Date(loan.dueDate) < new Date();

              return (
                <Card key={loan.id} className="p-4 flex flex-col gap-3 relative overflow-hidden">
                  {/* Status Indicator Stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPastDue ? 'bg-red-500' : 'bg-indigo-500'}`} />

                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <p className="font-bold text-gray-800 text-lg capitalize">
                        {member?.name || 'Unknown Member'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={loan.type === 'AUTO_CONTRIBUTION' ? 'warning' : 'info'}>
                          {loan.type === 'AUTO_CONTRIBUTION' ? 'Auto-Loan' : 'Standard'}
                        </Badge>
                        {isPastDue && <Badge variant="error">Past Due</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase">Remaining</p>
                      <p className="font-black text-indigo-600 text-xl">{formatMoney(remaining)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3 pl-2">
                    <div>
                      <span>Principal: </span>
                      <span className="font-semibold text-gray-700">{formatMoney(loan.principal)}</span>
                    </div>
                    <div>
                      <span>Due: </span>
                      <span className={`font-semibold ${isPastDue ? 'text-red-600' : 'text-gray-700'}`}>
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
