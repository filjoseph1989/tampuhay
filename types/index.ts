export type TransactionType = 'CONTRIBUTION' | 'LOAN_PAYMENT' | 'LOAN_DISBURSEMENT' | 'FINE' | 'EXPENSE';

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