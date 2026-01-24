import { create } from 'zustand';
import { GroupState, Member, Transaction, Loan } from '../types';

interface GroupStore {
  groupState: GroupState;
  members: Member[];
  transactions: Transaction[];
  activeLoans: Loan[];
  isLoading: boolean;

  // Async Actions
  fetchData: () => Promise<void>;
  approveLoan: (loanId: number) => Promise<void>;
  rejectLoan: (loanId: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  requestLoan: (loan: Omit<Loan, 'id'|'status'|'amountPaid'>) => Promise<void>;
    repayLoan: (loanId: number, amount: number) => Promise<void>;
    convertToAutoLoan: (memberId: number, amount: number) => Promise<void>;
    rolloverLoan: (loanId: number) => Promise<void>;
    
    // Still sync for now (UI only)
    setShareValue: (value: number) => void;
  updateMemberShares: (memberId: number, shares: number) => void;
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  // Initial State
  groupState: {
    totalPot: 0,
    cycleStart: new Date().toISOString(),
    targetPayoutDate: new Date(new Date().setMonth(new Date().getMonth() + 11)).toISOString(),
    shareValue: 1000,
  },
  members: [],
  transactions: [],
  activeLoans: [],
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [membersRes, txRes, loansRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/transactions'),
        fetch('/api/loans'),
      ]);

      const members = await membersRes.json();
      const transactions = await txRes.json();
      const activeLoans = await loansRes.json();

      // Calculate total pot from transactions
      let totalPot = 0;
      transactions.forEach((t: Transaction) => {
        switch (t.type) {
          case 'CONTRIBUTION':
          case 'FINE':
          case 'LOAN_PAYMENT':
            totalPot += t.amount;
            break;
          case 'LOAN_DISBURSEMENT':
          case 'EXPENSE':
            totalPot -= t.amount;
            break;
        }
      });

      set({
        members,
        transactions,
        activeLoans,
        groupState: { ...get().groupState, totalPot },
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ isLoading: false });
    }
  },

  approveLoan: async (loanId) => {
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      if (res.ok) await get().fetchData();
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  },

  rejectLoan: async (loanId) => {
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'REJECT' }),
      });
      if (res.ok) await get().fetchData();
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  },

  addTransaction: async (newTx) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(newTx),
      });
      if (res.ok) await get().fetchData();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  },

  requestLoan: async (newLoan) => {
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        body: JSON.stringify(newLoan),
      });
      if (res.ok) await get().fetchData();
    } catch (error) {
      console.error('Error requesting loan:', error);
    }
  },

  repayLoan: async (loanId, amount) => {
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'REPAY', amount }),
      });
      if (res.ok) await get().fetchData();
    } catch (error) {
      console.error('Error repaying loan:', error);
    }
  },

  convertToAutoLoan: async (memberId, amount) => {
    console.log('convertToAutoLoan not implemented yet');
  },

  rolloverLoan: async (loanId) => {
    console.log('rolloverLoan not implemented yet');
  },

  setShareValue: (value) => {
    set((state) => ({
      groupState: {
        ...state.groupState,
        shareValue: value,
      },
    }));
  },

  updateMemberShares: (memberId, shares) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, numberOfShares: shares } : m
      ),
    }));
  }
}));
