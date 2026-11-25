export type TransactionType = 'CONTRIBUTION' | 'LOAN_PAYMENT' | 'LOAN_DISBURSEMENT' | 'FINE' | 'EXPENSE' | 'INTEREST_EARNED' | 'LOAN_ROLLOVER';
export type LoanStatus = 'PENDING' | 'ACTIVE' | 'PAID' | 'DEFAULTED' | 'REJECTED';

export interface Member {
    id: number;
    name: string;
    role: 'TREASURER' | 'MEMBER' | 'KABERK';
    totalSaved: number;
    numberOfShares: number;
}

export interface Transaction {
    id: number;
    memberId: number;
    type: TransactionType;
    amount: number;
    date: string;
}

export interface GroupState {
    totalPot: number;
    cycleStart: string;
    targetPayoutDate: string;
    shareValue: number;
}

export interface Loan {
    id: number;
    memberId: number;
    type: 'STANDARD' | 'AUTO_CONTRIBUTION';
    principal: number;
    basePrincipal?: number | null;
    interestRate: number;
    startDate: string;
    dueDate: string;
    status: LoanStatus;
    amountPaid: number;
}