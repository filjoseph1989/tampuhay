export interface LoanQuote {
  principal: number;
  interest: number;       // The earnings for the group
  netProceeds: number;    // Cash the borrower receives
  totalRepayment: number; // Principal (or Principal + Interest depending on model)
}

/**
 * Calculates loan details based on the "Cali-out" (Upfront Deduction) model.
 * This is the standard for most informal Filipino lending (Tampuhay).
 *
 * Logic:
 * 1. Interest is calculated on the Principal.
 * 2. Interest is deducted immediately from the cash given to the borrower.
 * 3. Borrower repays the full Principal amount.
 *
 * @param amount - The principal amount to borrow
 * @param rate - The monthly interest rate in percentage (e.g., 5 for 5%)
 * @param borrower - The name of the borrower
 */
export const calculateLoan = (amount: number, rate: number, role: string = 'MEMBER'): LoanQuote => {
  const interest = amount * (rate / 100);

  if (role === 'KABERK' || role === 'TREASURER') {
    return {
      principal: amount,
      interest: interest,
      netProceeds: amount, // Borrower gets less than they asked for
      totalRepayment: amount + interest, // But pays back the full round number
    };
  }

  return {
    principal: amount,
    interest: interest,
    netProceeds: amount - interest, // Borrower gets less than they asked for
    totalRepayment: amount, // But pays back the full round number
  };
};
