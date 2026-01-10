import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGroupStore } from '../../store/useGroupStore';
import { formatMoney } from '../../lib/currency';
import { useState } from 'react';

interface LoanApplicationFormProps {
  borrowerName: string;
  amount: number;
  onCancel: () => void;
  onSuccess: () => void;
  loanQuote: {
    netProceeds: number;
    interest: number;
    totalRepayment: number;
  };
  interest_rate: number;
}

export default function LoanApplicationForm({
  borrowerName,
  amount,
  onCancel,
  onSuccess,
  loanQuote,
  interest_rate,
}: LoanApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const members = useGroupStore((state) => state.members);
  const requestLoan = useGroupStore((state) => state.requestLoan);
  const member = members.find((m) => m.name.toLowerCase() === borrowerName.toLowerCase())

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!member || !agreed) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // This is for API
    requestLoan({
      memberId: member.id,
      principal: amount,
      interestRate: interest_rate,
      startDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
    });
    setIsSubmitting(false);
    if (onSuccess) onSuccess();
  }

  if (!member) {
    return (
      <Card className="max-w-md mx-auto p-6">
        <p className="text-red-500">Please select a valid member in the calculator first.</p>
        <Button
          variant="secondary"
          onClick={onCancel}
          className="mt-4" fullWidth>
          Back to Calculator
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Confirm Loan Request</h2>
          <p className="text-sm text-gray-500">Review your application details below.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-500">Borrower</span>
            <span className="font-bold text-gray-800">
              {member.name.charAt(0).toUpperCase() + member.name.slice(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Principal</span>
            <span className="font-bold text-gray-800">
              {formatMoney(amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">You receive</span>
            <span className="font-bold text-gray-800">
              {formatMoney(loanQuote.netProceeds)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">You repay</span>
            <span className="font-bold text-gray-800">
              {formatMoney(loanQuote.totalRepayment)}
            </span>
          </div>
          <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
            <span className="text-gray-400">Due Date</span>
            <span className="text-gray-500">{new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <input id="agreement"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required />
          <label htmlFor="agreement" className="text-sm text-gray-600 leading-tight">
            I agree to the {interest_rate}% interest and penalties as per group rules.
          </label>
        </div>
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onCancel}
            disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!agreed || isSubmitting || amount <= 0}
            fullWidth>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
      <Button
        variant="secondary"
        onClick={onCancel}
        className="mt-4 cursor-pointer" fullWidth>
        Back to Calculator
      </Button>
    </Card>
  )
}