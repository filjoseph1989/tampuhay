import { useMemo } from 'react';
import { useGroupStore } from '../../store/useGroupStore';
import { Card } from '../ui/Card';
import { formatMoney } from '../../lib/currency';

export default function AdminStats() {
  const { groupState, activeLoans, transactions, members } = useGroupStore();

  const stats = useMemo(() => {
    // 1. Outstanding Loans
    const outstanding = activeLoans
      .filter(l => l.status === 'ACTIVE')
      .reduce((sum, l) => sum + l.principal, 0);

    // 2. Collection Progress
    const targetCollection = members.reduce((sum, m) => sum + (m.numberOfShares * groupState.shareValue), 0);
    const actualCollection = transactions
      .filter(t => t.type === 'CONTRIBUTION')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const collectionRate = targetCollection > 0 
      ? Math.round((actualCollection / targetCollection) * 100) 
      : 0;

    return {
      totalPot: groupState.totalPot,
      outstanding,
      collectionRate,
      targetCollection,
      actualCollection
    };
  }, [groupState, activeLoans, transactions, members]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4 bg-teal-50 border-teal-100">
        <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">Total Pot</p>
        <p className="text-2xl font-black text-teal-900">{formatMoney(stats.totalPot)}</p>
        <div className="mt-2 h-1 w-full bg-teal-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 w-full opacity-50" />
        </div>
      </Card>

      <Card className="p-4 bg-indigo-50 border-indigo-100">
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Outstanding Loans</p>
        <p className="text-2xl font-black text-indigo-900">{formatMoney(stats.outstanding)}</p>
        <p className="text-[10px] text-indigo-400 mt-1 italic">Money currently in circulation</p>
      </Card>

      <Card className="p-4 bg-orange-50 border-orange-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Share Collection</p>
            <p className="text-2xl font-black text-orange-900">{stats.collectionRate}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-orange-500 font-bold">
              {formatMoney(stats.actualCollection)}
            </p>
            <p className="text-[10px] text-gray-400">of {formatMoney(stats.targetCollection)}</p>
          </div>
        </div>
        <div className="mt-2 h-1 w-full bg-orange-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-500" 
            style={{ width: `${Math.min(stats.collectionRate, 100)}%` }} 
          />
        </div>
      </Card>
    </div>
  );
}
