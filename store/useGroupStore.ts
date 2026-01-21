import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GroupState, Member, Transaction, Loan } from '../types';
import { calculateLoan } from '@/lib/loanCalculator';

interface GroupStore {
  groupState: GroupState;
  members: Member[];
  transactions: Transaction[];
  activeLoans: Loan[];
  approveLoan: (loanId: string) => void;
  rejectLoan: (loanId: string) => void;

  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  getMemberTransactions: (memberId: string) => Transaction[];
  requestLoan: (loan: Omit<Loan, 'id'|'status'|'amountPaid'>) => void;
  repayLoan: (loanId: string, amount: number) => void;
  convertToAutoLoan: (memberId: string, amount: number) => void;
  rolloverLoan: (loanId: string) => void;
  setShareValue: (value: number) => void;
  updateMemberShares: (memberId: string, shares: number) => void;
}

// --- MOCK DATA FOR PHASE 1 ---
const MOCK_MEMBERS: Member[] = [
  { id: '1', name: 'fil (Treasurer)', role: 'TREASURER', totalSaved: 0, numberOfShares: 0 },
  { id: '2', name: 'romel', role: 'KABERK', totalSaved: 0, numberOfShares: 0 },
  { id: '3', name: 'ronald', role: 'MEMBER', totalSaved: 0, numberOfShares: 0 },
  { id: '4', name: 'bernard', role: 'KABERK', totalSaved: 0, numberOfShares: 0 },
  { id: '5', name: 'charlotte', role: 'KABERK', totalSaved: 0, numberOfShares: 0 },
  { id: '6', name: 'leslie', role: 'KABERK', totalSaved: 0, numberOfShares: 0 },
  { id: '7', name: 'rejean', role: 'KABERK', totalSaved: 0, numberOfShares: 0 },
  { id: '8', name: 'rodelyn', role: 'KABERK', totalSaved: 0, numberOfShares: 0 },
  { id: '9', name: 'connie', role: 'KABERK', totalSaved: 0, numberOfShares: 0 },
  { id: '10', name: 'ailene', role: 'KABERK', totalSaved: 0, numberOfShares: 0 },
];

const MOCK_TRANSACTIONS: Transaction[] = [];

const MOCK_ACTIVE_LOANS: Loan[] = [
  {
    id: 'loan-past-due-1',
    memberId: '2', // romel
    type: 'STANDARD',
    principal: 5000,
    interestRate: 5,
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(), // 2 months ago
    dueDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),   // 1 month ago (Past Due)
    status: 'ACTIVE',
    amountPaid: 0,
  },
  {
    id: 'loan-past-due-2',
    memberId: '3', // ronald
    type: 'AUTO_CONTRIBUTION',
    principal: 1000,
    interestRate: 5,
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),     // 5 days ago (Past Due)
    status: 'ACTIVE',
    amountPaid: 0,
  }
];

export const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      // Initial State
      groupState: {
        totalPot: 0, // Sum of mock contributions
        cycleStart: new Date().toISOString(),
        targetPayoutDate: new Date(new Date().setMonth(new Date().getMonth() + 11)).toISOString(), // ~1 year from now
        shareValue: 1000,
      },
      members: MOCK_MEMBERS,
      transactions: MOCK_TRANSACTIONS,
      activeLoans: MOCK_ACTIVE_LOANS,

      approveLoan: (loanId) => {
        const state = get();
        const loanIndex = state.activeLoans.findIndex((l) => l.id === loanId);
        if (loanIndex === -1) return;

        const loan = state.activeLoans[loanIndex];
        const member = state.members.find((m) => m.id === loan.memberId);
        if (!member) return;

        const { netProceeds, interest } = calculateLoan(loan.principal, loan.interestRate, member.role);
        const updatedLoans = [...state.activeLoans];
        updatedLoans[loanIndex] = { ...loan, status: 'ACTIVE' };

        set({ activeLoans: updatedLoans });

        // disbursement
        get().addTransaction({
          memberId: loan.memberId,
          type: 'LOAN_DISBURSEMENT',
          amount: netProceeds,
          date: new Date().toISOString(),
        });

        // Interest earned
        get().addTransaction({
          memberId: loan.memberId,
          type: 'INTEREST_EARNED',
          amount: interest,
          date: new Date().toISOString(),
        });
      },

      rejectLoan: (loanId) => {
        set((state) => {
          const updatedLoans = state.activeLoans.map((l) => {
            return l.id === loanId
              ? { ...l, status: 'REJECTED' as const }
              : l
            });
          return ({ activeLoans: updatedLoans });
        })
      },

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
            case 'INTEREST_EARNED':
            case 'LOAN_ROLLOVER':
              // Interest earned is a record, doesn't change pot here as it's often deducted upfront (netProceeds)
              // Rollover is an accounting event, no cash flow
              potChange = 0;
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

      requestLoan: (newLoan) => {
        const loan: Loan = {
          ...newLoan,
          id: Math.random().toString(36).substring(7),
          status: 'PENDING',
          amountPaid: 0,
        };

        set((state) => ({
          activeLoans: [loan, ...state.activeLoans],
        }));
      },

      repayLoan: (loanId, amount) => {
        const state = get();
        const loanIndex = state.activeLoans.findIndex((l) => l.id === loanId);
        if (loanIndex === -1) return;

        const loan = state.activeLoans[loanIndex];
        const newAmountPaid = loan.amountPaid + amount;
        const isFullyPaid = newAmountPaid >= loan.principal;

        const updatedLoans = [...state.activeLoans];
        updatedLoans[loanIndex] = {
          ...loan,
          amountPaid: newAmountPaid,
          status: isFullyPaid ? 'PAID' : 'ACTIVE',
        };

        set({ activeLoans: updatedLoans });

        // Record the transaction
        get().addTransaction({
          memberId: loan.memberId,
          type: 'LOAN_PAYMENT',
          amount: amount,
          date: new Date().toISOString(),
        });
      },

      convertToAutoLoan: (memberId, amount) => {
        const state = get();
        const member = state.members.find(m => m.id === memberId);
        if (!member) return;

        const INTEREST_RATE = 5; // 5% flat interest per requirement

        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 1);

        const loan: Loan = {
          id: Math.random().toString(36).substring(7),
          memberId,
          type: 'AUTO_CONTRIBUTION',
          principal: amount, // Use original amount for the first loan
          interestRate: INTEREST_RATE,
          startDate: new Date().toISOString(),
          dueDate: dueDate.toISOString(),
          status: 'ACTIVE',
          amountPaid: 0,
        };

        // 1. Add the Loan
        set((state) => ({
          activeLoans: [loan, ...state.activeLoans],
        }));

        // 2. Dual Transaction Logic
        // Transaction A: The Payment (Increases Member Savings and Pot)
        get().addTransaction({
          memberId,
          type: 'CONTRIBUTION',
          amount: amount,
          date: new Date().toISOString(),
        });

        // Transaction B: The Funding (Decreases Pot, netting out the cash impact)
        get().addTransaction({
          memberId,
          type: 'LOAN_DISBURSEMENT',
          amount: amount,
          date: new Date().toISOString(),
        });
      },

      rolloverLoan: (loanId) => {
        const state = get();
        const loanIndex = state.activeLoans.findIndex((l) => l.id === loanId);
        if (loanIndex === -1) return;

        const oldLoan = state.activeLoans[loanIndex];
        const INTEREST_RATE = 5; // Standard 5%

        // Rollover Logic:
        // New Principal = Old Principal + Penalty Interest (5% of Old Principal)
        const penalty = oldLoan.principal * (INTEREST_RATE / 100);
        const newPrincipal = oldLoan.principal + penalty;

        const newDueDate = new Date();
        newDueDate.setMonth(newDueDate.getMonth() + 1);

        const newLoan: Loan = {
          id: Math.random().toString(36).substring(7),
          memberId: oldLoan.memberId,
          type: 'STANDARD', // Rollover becomes a standard loan obligation
          principal: newPrincipal,
          interestRate: INTEREST_RATE,
          startDate: new Date().toISOString(),
          dueDate: newDueDate.toISOString(),
          status: 'ACTIVE',
          amountPaid: 0,
        };

        // Update State
        set((state) => {
          // 1. Mark old loan as PAID (Refinanced)
          const updatedLoans = state.activeLoans.map(l =>
            l.id === loanId ? { ...l, status: 'PAID' as const } : l
          );

          // 2. Add the new Loan
          return {
            activeLoans: [newLoan, ...updatedLoans],
          };
        });

        // 3. Record the Penalty Interest as a transaction (Recent Activity)
        get().addTransaction({
          memberId: oldLoan.memberId,
          type: 'INTEREST_EARNED',
          amount: penalty,
          date: new Date().toISOString(),
        });

        // 4. Record the Rollover Event (New Loan Creation)
        get().addTransaction({
          memberId: oldLoan.memberId,
          type: 'LOAN_ROLLOVER',
          amount: newPrincipal,
          date: new Date().toISOString(),
        });
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
    }),
    {
      name: 'tampuhay-group-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);