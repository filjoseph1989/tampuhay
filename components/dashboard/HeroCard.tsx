import React from 'react';
import { formatMoney } from '../../lib/currency';

interface HeroCardProps {
  totalPot: number;
  daysUntilPayout: number;
}

export default function HeroCard({ totalPot, daysUntilPayout }: HeroCardProps) {
  return (
    <div className="bg-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-200">
      <p className="text-green-100 text-sm font-medium mb-1">Total Group Saving</p>
      <h2 className="text-4xl font-bold mb-4 tracking-tight">
        {formatMoney(totalPot)}
      </h2>

      <div className="flex items-center justify-between bg-green-700/40 rounded-lg p-3 backdrop-blur-sm">
        <span className="text-sm text-green-50 font-medium">Days until payout</span>
        <span className="font-bold text-white">{daysUntilPayout} Days</span>
      </div>
    </div>
  );
}
