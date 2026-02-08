'use client';

import KaberkReport from '../../components/features/KaberkReport';

export default function ReportPage() {
  return (
    <div className="pt-2 pb-20 space-y-6">
      <div className="flex flex-col items-center justify-center mb-6">
        <h1 className="text-2xl font-bold text-teal-700">Financial Report</h1>
        <p className="text-sm text-gray-500">Pot status and active loans</p>
      </div>

      <KaberkReport />
    </div>
  );
}
