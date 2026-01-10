import { create } from 'zustand';
import { GroupState, Member, Transaction } from '../types';

interface GroupStore {
  groupState: GroupState;
  members: Member[];
  transactions: Transaction[];

  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  getMemberTransactions: (memberId: string) => Transaction[];
}

// --- MOCK DATA FOR PHASE 1 ---
const MOCK_MEMBERS: Member[] = [
  { id: '1', name: 'fil (Treasurer)', role: 'TREASURER', totalSaved: 0 },
  { id: '2', name: 'romel', role: 'KABERK', totalSaved: 0 },
  { id: '3', name: 'bonald', role: 'MEMBER', totalSaved: 0 },
  { id: '4', name: 'bernard', role: 'KABERK', totalSaved: 0 },
  { id: '5', name: 'charlotte', role: 'KABERK', totalSaved: 0 },
  { id: '6', name: 'leslie', role: 'KABERK', totalSaved: 0 },
  { id: '7', name: 'rejean', role: 'KABERK', totalSaved: 0 },
  { id: '8', name: 'rodelyn', role: 'KABERK', totalSaved: 0 },
  { id: '9', name: 'connie', role: 'KABERK', totalSaved: 0 },
  { id: '10', name: 'ailene', role: 'KABERK', totalSaved: 0 },
];

const MOCK_TRANSACTIONS: Transaction[] = [];

export const useGroupStore = create<GroupStore>((set, get) => ({
  // Initial State
  groupState: {
    totalPot: 0, // Sum of mock contributions
    cycleStart: new Date().toISOString(),
    targetPayoutDate: new Date(new Date().setMonth(new Date().getMonth() + 11)).toISOString(), // ~1 year from now
  },
  members: MOCK_MEMBERS,
  transactions: MOCK_TRANSACTIONS,

  // Actions
  addTransaction: (newTx) => {
    // 1. Generate a simple ID
    const transaction: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substring(7),
    };

    set((state) => {
      let potChange = 0;
      let memberSavingsChange = 0;

      // 2. Calculate Logic based on Transaction Type
      switch (transaction.type) {
        case 'CONTRIBUTION':
          potChange = transaction.amount;
          memberSavingsChange = transaction.amount;
          break;
        case 'FINE':
        case 'LOAN_PAYMENT':
          // Fines and Loan Payments increase the Pot, but NOT the member's personal savings balance
          potChange = transaction.amount;
          break;
        case 'LOAN_DISBURSEMENT':
        case 'EXPENSE':
          // Money leaving the pot
          potChange = -transaction.amount;
          break;
      }

      // 3. Update the specific Member's savings
      const updatedMembers = state.members.map((m) => {
        if (m.id === transaction.memberId) {
          return { ...m, totalSaved: m.totalSaved + memberSavingsChange };
        }
        return m;
      });

      // 4. Update the Global State
      return {
        transactions: [transaction, ...state.transactions], // Add new tx to top of list
        members: updatedMembers,
        groupState: {
          ...state.groupState,
          totalPot: state.groupState.totalPot + potChange,
        },
      };
    });
  },

  getMemberTransactions: (memberId) => {
    return get().transactions.filter((t) => t.memberId === memberId);
  },
}));