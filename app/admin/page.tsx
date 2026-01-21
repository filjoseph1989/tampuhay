'use client';

import { useGroupStore } from '../../store/useGroupStore';
import CycleManagement from '../../components/admin/CycleManagement';
import { CollapsibleSection } from '../../components/ui/CollapsibleSection';
import LoanApprovalDashboard from '../../components/admin/LoanApprovalDashboard';
import ActiveLoansManager from '../../components/admin/ActiveLoansManager';
import AddTransactionForm from '../../components/admin/AddTransactionForm';
import TransactionFeed from '../../components/ledger/TransactionFeed';
import AdminStats from '../../components/admin/AdminStats';

export default function AdminPage() {
  const { members, addTransaction, transactions } = useGroupStore();

  return (
    <div className="pt-2 space-y-6 pb-20">
      <div className="flex flex-col items-center justify-center mb-6">
        <h1 className="text-2xl font-bold text-teal-700">Treasurer Tools</h1>
        <p className="text-sm text-gray-500">Manage cycle, loans, and transactions</p>
      </div>

      <AdminStats />

      <CollapsibleSection title="Cycle Management" defaultExpanded={false}>
        <CycleManagement />
      </CollapsibleSection>

      <CollapsibleSection title="Loan Requests" defaultExpanded={true}>
        <LoanApprovalDashboard />
      </CollapsibleSection>

      <CollapsibleSection title="Active Loans" defaultExpanded={false}>
        <ActiveLoansManager />
      </CollapsibleSection>

      <CollapsibleSection title="Record Transaction" defaultExpanded={false}>
        <AddTransactionForm
          members={members}
          addTransaction={addTransaction} />
      </CollapsibleSection>

      <CollapsibleSection title="Recent Activity" defaultExpanded={false}>
        <TransactionFeed
          transactions={transactions}
          members={members} />
      </CollapsibleSection>
    </div>
  );
}
