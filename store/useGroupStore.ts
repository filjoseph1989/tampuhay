import { create } from 'zustand';
import { GroupState, Member, Transaction, Loan } from '../types';
import { toast } from 'sonner';

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
  setShareValue: (value: number) => Promise<void>;
  updateMemberShares: (memberId: number, shares: number) => Promise<void>;
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
      const [membersRes, txRes, loansRes, cycleRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/transactions'),
        fetch('/api/loans'),
        fetch('/api/cycles/active'),
      ]);

      const membersData = await membersRes.json();
      const transactionsData = await txRes.json();
      const activeLoansData = await loansRes.json();
      const activeCycleData = await cycleRes.json();
      
      const members: Member[] = Array.isArray(membersData) ? membersData : [];
      const transactions: Transaction[] = Array.isArray(transactionsData) ? transactionsData : [];
      const activeLoans: Loan[] = Array.isArray(activeLoansData) ? activeLoansData : [];
      const activeCycle = activeCycleData && activeCycleData.startDate ? activeCycleData : { 
        startDate: new Date().toISOString(), 
        targetPayoutDate: new Date().toISOString(), 
        shareValue: 1000 
      };

      // Calculate total pot from transactions
      let totalPot = 0;
      if (Array.isArray(transactions)) {
        for (const t of transactions) {
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
        }
      }

      set({
        members,
        transactions,
        activeLoans,
        groupState: {
          totalPot,
          cycleStart: activeCycle.startDate,
          targetPayoutDate: activeCycle.targetPayoutDate,
          shareValue: activeCycle.shareValue
        },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      if (res.ok) {
        await get().fetchData();
        toast.success('Loan approved successfully');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to approve loan');
      }
    } catch (error) {
      console.error('Error approving loan:', error);
      toast.error('An error occurred');
    }
  },

  rejectLoan: async (loanId) => {
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT' }),
      });
      if (res.ok) {
        await get().fetchData();
        toast.success('Loan rejected');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to reject loan');
      }
    } catch (error) {
      console.error('Error rejecting loan:', error);
      toast.error('An error occurred');
    }
  },

  addTransaction: async (newTx) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx),
      });
      if (res.ok) {
        await get().fetchData();
        toast.success('Transaction recorded');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to add transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('An error occurred');
    }
  },

  requestLoan: async (newLoan) => {
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoan),
      });
      if (res.ok) {
        await get().fetchData();
        toast.success('Loan requested successfully');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to request loan');
      }
    } catch (error) {
      console.error('Error requesting loan:', error);
      toast.error('An error occurred');
    }
  },

  repayLoan: async (loanId, amount) => {
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REPAY', amount }),
      });
      if (res.ok) {
        await get().fetchData();
        toast.success('Payment recorded');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error repaying loan:', error);
      toast.error('An error occurred');
    }
  },

  convertToAutoLoan: async (memberId, amount) => {
    try {
      const res = await fetch('/api/loans/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, amount }),
      });
      if (res.ok) {
        await get().fetchData();
        toast.success('Converted to Auto-Loan');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to convert');
      }
    } catch (error) {
      console.error('Error converting to auto-loan:', error);
      toast.error('An error occurred');
    }
  },

  rolloverLoan: async (loanId) => {
    try {
      const res = await fetch('/api/loans/rollover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId }),
      });
      if (res.ok) {
        await get().fetchData();
        toast.success('Loan Rollover successful');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to rollover loan');
      }
    } catch (error) {
      console.error('Error rolling over loan:', error);
      toast.error('An error occurred');
    }
  },

  setShareValue: async (value) => {
    try {
      const res = await fetch('/api/cycles/active', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareValue: value }),
      });
      if (res.ok) {
        await get().fetchData();
        toast.success('Share value updated');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to update share value');
      }
    } catch (error) {
      console.error('Error updating share value:', error);
      toast.error('An error occurred');
    }
  },

  updateMemberShares: async (memberId, shares) => {
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numberOfShares: shares }),
      });
      if (res.ok) {
        await get().fetchData();
        toast.success('Member shares updated');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to update shares');
      }
    } catch (error) {
      console.error('Error updating shares:', error);
      toast.error('An error occurred');
    }
  }
}));
