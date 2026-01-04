import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { calculateLoan } from '../../lib/loanCalculator';
import { formatMoney } from '../../lib/currency';

export default function LoanCalculator() {
  const [amount, setAmount] = useState<number>(1000);
  const interestRate = 5; // Default 5% as per docs

  const quote = useMemo(() => {
    return calculateLoan(amount, interestRate);
  }, [amount, interestRate]);

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
          
          <input
            type="range"
            min="500"
            max="10000"
            step="500"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>₱500</span>
            <span>₱10,000</span>
          </div>
        </div>

        <div className="bg-teal-50 rounded-2xl p-6 space-y-4 border border-teal-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">You borrow:</span>
            <span className="font-bold text-gray-800">{formatMoney(quote.principal)}</span>
          </div>
          
          <div className="flex justify-between items-center text-red-600">
            <span className="text-sm italic">Interest ({interestRate}%):</span>
            <span className="font-medium">-{formatMoney(quote.interest)}</span>
          </div>

          <div className="pt-4 border-t border-teal-200/50 flex justify-between items-end">
            <div>
              <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider">You receive</p>
              <p className="text-2xl font-black text-teal-700">{formatMoney(quote.netProceeds)}</p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-sm text-gray-500">
              You pay back <span className="font-bold text-gray-700">{formatMoney(quote.totalRepayment)}</span> in 30 days
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
