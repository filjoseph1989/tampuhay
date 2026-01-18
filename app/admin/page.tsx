'use client';

import { useGroupStore } from '../../store/useGroupStore';
import CycleManagement from '../../components/admin/CycleManagement';
import LoanApprovalDashboard from '../../components/admin/LoanApprovalDashboard';
import AddTransactionForm from '../../components/admin/AddTransactionForm';

export default function AdminPage() {
  const { members, addTransaction } = useGroupStore();

  return (
    <div className="pt-2 space-y-8 pb-8">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-teal-700">Treasurer Tools</h1>
        <p className="text-sm text-gray-500">Manage cycle, loans, and transactions</p>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Cycle Management</h4>
        <CycleManagement />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Loan Requests</h4>
        <LoanApprovalDashboard />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Record Transaction</h4>
        <AddTransactionForm
          members={members}
          addTransaction={addTransaction} />
      </div>
    </div>
  );
}
