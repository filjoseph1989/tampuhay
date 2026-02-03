import { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { calculateLoan } from '../../lib/loanCalculator';
import { formatMoney } from '../../lib/currency';
import { useGroupStore } from '../../store/useGroupStore';
import { Button } from '../ui/Button';
import LoanApplicationForm from './LoanApplicationForm'

export default function LoanCalculator() {
  const [amount, setAmount] = useState<number>(0);
  const [borrower, setBorrower] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const membersData = useGroupStore((state) => state.members);
  const members = Array.isArray(membersData) ? membersData : [];
  const totalPot = useGroupStore((state) => state.groupState.totalPot);
  const INTEREST_RATE = 5; // 5% Interest

  const member = members.find((m) => m.name === borrower);
  const role = member ? member.role : 'MEMBER';
  const loanQuote = calculateLoan(amount, INTEREST_RATE, role);
  const exceedsPot = amount > totalPot;

  if (success) {
    return (
      <Card className="max-w-md mx-auto text-center py-10 space-y-4">
        <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Application Sent!</h2>
        <p className="text-gray-500">Your loan request has been submitted for approval.</p>
        <Button onClick={() => { setSuccess(false); setAmount(0); setBorrower(''); }} variant="secondary">
          Close
        </Button>
      </Card>
    )
  }

  if (showForm) {
    return (
      <LoanApplicationForm
        borrowerName={borrower}
        amount={amount}
        onCancel={() => setShowForm(false)}
        onSuccess= {() => {
          setShowForm(false);
          setSuccess(true);
        }}
        loanQuote={loanQuote}
        interest_rate={INTEREST_RATE}
      />
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Loan Calculator</h2>
          <p className="text-sm text-gray-500">Check how much you receive and pay back.</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Who is borrowing?"
            type="text"
            value={borrower}
            onChange={(e) => setBorrower(e.target.value)}
            list="member-list"
            placeholder="Type to search..."
          />
          <datalist id="member-list">
            {members.map((m) => (
              <option key={m.id} value={m.name} />
            ))}
          </datalist>

          <div className="space-y-1">
            <Input
              label="How much do you want to borrow?"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={0}
              step={100}
              error={exceedsPot ? `Amount exceeds total pot (${formatMoney(totalPot)})` : undefined}
            />
            {exceedsPot && (
              <p className="text-xs font-medium text-red-500 animate-pulse">
                ⚠️ Insufficient funds in the group pot.
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Interest ({INTEREST_RATE}%)</span>
              <span className={`font-medium ${
                role === 'KABERK' || role === 'TREASURER' ? 'text-green-600' : 'text-red-600'
              }`}>
                + {formatMoney(loanQuote.interest)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cash You Receive</span>
              <span className="font-bold text-green-700 text-lg">
                {formatMoney(loanQuote.netProceeds)}
              </span>
            </div>
            <div className="pt-2 border-t border-blue-200 flex justify-between text-sm">
              <span className="text-gray-600">Total to Repay</span>
              <span className="font-bold text-gray-900">
                {formatMoney(loanQuote.totalRepayment)}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            * Interest is deducted upfront (Cali-out).
          </p>

          <Button fullWidth
            className="cursor-pointer"
            disabled={!member || amount <= 0 || exceedsPot}
            onClick={() => setShowForm(true)}>
            Apply Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
