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
  // Members pay 10% interest, Kaberks/Treasurer pay the standard rate (usually 5%)
  const effectiveRate = (role === 'KABERK' || role === 'TREASURER') ? rate : 10;
  const interest = amount * (effectiveRate / 100);

  return {
    principal: amount,
    interest: interest,
    netProceeds: amount, // Everyone gets full cash upfront
    totalRepayment: amount + interest, // Everyone repays Principal + Interest
  };
};
