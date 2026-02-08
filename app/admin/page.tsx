'use client';

import { useState } from 'react';
import { useGroupStore } from '../../store/useGroupStore';
import { CollapsibleSection } from '../../components/ui/CollapsibleSection';
import CycleManagement from '../../components/admin/CycleManagement';
import LoanApprovalDashboard from '../../components/admin/LoanApprovalDashboard';
import ActiveLoansManager from '../../components/admin/ActiveLoansManager';
import AddTransactionForm from '../../components/admin/AddTransactionForm';
import AddMemberForm from '../../components/admin/AddMemberForm';
import TransactionFeed from '../../components/ledger/TransactionFeed';
import AdminStats from '../../components/admin/AdminStats';

export default function AdminPage() {
  const { members, addTransaction, transactions, addMember } = useGroupStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="pt-2 space-y-6 pb-20">
      <div className="flex flex-col items-center justify-center mb-6">
        <h1 className="text-2xl font-bold text-teal-700">Treasurer Tools</h1>
        <p className="text-sm text-gray-500">Manage members, cycle, and loans</p>
      </div>

      <AdminStats />

      <CollapsibleSection
        title="Member Management"
        isExpanded={activeSection === 'members'}
        onToggle={() => toggleSection('members')}>
        <AddMemberForm addMember={addMember} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Cycle Management"
        isExpanded={activeSection === 'cycle'}
        onToggle={() => toggleSection('cycle')}>
        <CycleManagement />
      </CollapsibleSection>

      <CollapsibleSection
        title="Loan Requests"
        isExpanded={activeSection === 'requests'}
        onToggle={() => toggleSection('requests')}>
        <LoanApprovalDashboard />
      </CollapsibleSection>

      <CollapsibleSection
        title="Active Loans"
        isExpanded={activeSection === 'active'}
        onToggle={() => toggleSection('active')}>
        <ActiveLoansManager />
      </CollapsibleSection>

      <CollapsibleSection
        title="Record Transaction"
        isExpanded={activeSection === 'transaction'}
        onToggle={() => toggleSection('transaction')}>
        <AddTransactionForm
          members={members}
          addTransaction={addTransaction} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Recent Activity"
        isExpanded={activeSection === 'activity'}
        onToggle={() => toggleSection('activity')}>
        <TransactionFeed
          transactions={transactions}
          members={members} />
      </CollapsibleSection>
    </div>
  );
}
