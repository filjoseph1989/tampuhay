// Group interest rules (simple interest, month-end deadlines):
// - Interest is charged on the ORIGINAL amount borrowed (basePrincipal), not on the growing balance.
// - An AUTO_CONTRIBUTION loan (unpaid contribution) is interest-free for its first month;
//   interest starts the month after, once the month-end deadline passes unpaid.
// - Each month's interest is fully earned only at the month-end deadline; before that it
//   accrues by days elapsed.

type LoanLike = {
  type: string;
  principal: number;
  basePrincipal?: number | null;
  interestRate: number;
};

/** The amount simple interest is charged on. */
export function interestBase(loan: LoanLike): number {
  return loan.basePrincipal ?? loan.principal;
}

/** Full interest for this loan's month (what gets added if unpaid at the deadline). */
export function monthlyInterest(loan: LoanLike, rate: number = loan.interestRate): number {
  if (loan.type === 'AUTO_CONTRIBUTION') return 0;
  return interestBase(loan) * (rate / 100);
}

/** Total owed at this loan's due date (balance + this month's interest). */
export function totalOwed(loan: LoanLike, rate: number = loan.interestRate): number {
  return loan.principal + monthlyInterest(loan, rate);
}

const PH = 'Asia/Manila';
const phDay = (d: Date) => Number(d.toLocaleDateString('en-PH', { timeZone: PH, day: 'numeric' }));

/**
 * Interest accrued so far this month. Before the deadline it is pro-rated by days elapsed
 * (e.g. 25/30 on Nov 25); on/after the deadline it is the full month.
 */
export function accruedInterest(
  loan: LoanLike & { dueDate: Date | string },
  now: Date = new Date(),
  rate: number = loan.interestRate,
): { interest: number; days: number; daysInMonth: number } {
  const due = new Date(loan.dueDate);
  const daysInMonth = phDay(due); // due date is the last day of its month
  const days = now < due ? Math.min(phDay(now), daysInMonth) : daysInMonth;
  return { interest: (monthlyInterest(loan, rate) * days) / daysInMonth, days, daysInMonth };
}
