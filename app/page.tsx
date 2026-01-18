'use client'

import HeroCard from '../components/dashboard/HeroCard';
import LoanCalculator from '../components/features/LoanCalculator';
import { useGroupStore } from '../store/useGroupStore';
import { useMemo } from 'react'

export default function Home() {
  const { groupState } = useGroupStore();

  /**
   * Para ni mag calculate pila nalang ka days
   * ang nabilin para mag payout
   */
  const daysUntilPayout = useMemo(() => {
      const target = new Date(groupState.targetPayoutDate);
      const today = new Date();
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }, [groupState.targetPayoutDate]);

  return (
    <>
      <div className="flex flex-col items-center justify-center py-2">
        <h1 className="text-2xl font-bold text-teal-700">Welcome to Tampuhay</h1>
      </div>

      <HeroCard
        totalPot={groupState.totalPot}
        daysUntilPayout={daysUntilPayout} />

      <div className="pt-8 space-y-6">
        <LoanCalculator />
      </div>
    </>
  );
}
