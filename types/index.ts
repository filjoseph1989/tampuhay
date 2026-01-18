export type TransactionType = 'CONTRIBUTION' | 'LOAN_PAYMENT' | 'LOAN_DISBURSEMENT' | 'FINE' | 'EXPENSE' | 'INTEREST_EARNED';
export type LoanStatus = 'PENDING' | 'ACTIVE' | 'PAID' | 'DEFAULTED' | 'REJECTED';

export interface Member {
    id: string;
    name: string;
    role: 'TREASURER' | 'MEMBER' | 'KABERK';
    totalSaved: number;
    numberOfShares: number;
}

export interface Transaction {
    id: string;
    memberId: string;
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
    id: string;
    memberId: string;
    type: 'STANDARD' | 'AUTO_CONTRIBUTION';
    principal: number;
    interestRate: number;
    startDate: string;
    dueDate: string;
    status: LoanStatus;
    amountPaid: number;
}