export type TransactionType = 'CONTRIBUTION' | 'LOAN_PAYMENT' | 'LOAN_DISBURSEMENT' | 'FINE' | 'EXPENSE';
export type LoanStatus = 'PENDING' | 'ACTIVE' | 'PAID' | 'DEFAULTED';

export interface Member {
    id: string;
    name: string;
    role: 'TREASURER' | 'MEMBER';
    totalSaved: number;
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
}

export interface Loan {
    id: string;
    memberId: string;
    principal: number;
    interestRate: number;
    startDate: string;
    dueDate: string;
    status: LoanStatus;
    amountPaid: number;
}