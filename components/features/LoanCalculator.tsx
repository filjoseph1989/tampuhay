import { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { calculateLoan } from '../../lib/loanCalculator';
import { formatMoney } from '../../lib/currency';

export default function LoanCalculator() {
  const [amount, setAmount] = useState<number>(1000);
  const INTEREST_RATE = 5; // 5% Interest

  const loanQuote = calculateLoan(amount, INTEREST_RATE);

  return (
    <Card className="max-w-md mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Loan Calculator</h2>
          <p className="text-sm text-gray-500">Check how much you receive and pay back.</p>
        </div>

        <div className="space-y-4">
          <Input
            label="How much do you want to borrow?"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={0}
            step={100}
          />

          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Interest ({INTEREST_RATE}%)</span>
              <span className="font-medium text-red-600">
                - {formatMoney(loanQuote.interest)}
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
        </div>
      </div>
    </Card>
  );
}
