import { useState } from 'react';
import { useGroupStore } from '../../store/useGroupStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatMoney } from '../../lib/currency';

export default function CycleSettings() {
  const members = useGroupStore((state) => state.members);
  const shareValue = useGroupStore((state) => state.groupState.shareValue);
  const setShareValue = useGroupStore((state) => state.setShareValue);
  const updateMemberShares = useGroupStore((state) => state.updateMemberShares);

  const [isExpanded, setIsExpanded] = useState(false);
  const [editingShareValue, setEditingShareValue] = useState(shareValue);

  const handleShareValueChange = () => {
    if (confirm(`Update Share Value to ${formatMoney(editingShareValue)}? This will affect all calculations.`)) {
      setShareValue(editingShareValue);
    }
  };

  const handleMemberShareChange = (memberId: string, newShares: number) => {
    if (newShares < 1) return;
    updateMemberShares(memberId, newShares);
  };

  if (!isExpanded) {
    return (
      <Card className="p-4 flex justify-between items-center bg-gray-50 border-dashed border-2 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(true)}>
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-700">Cycle Settings</h3>
            <p className="text-xs text-gray-500">Configure Share Value & Member Commitments</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800">{formatMoney(shareValue)} / Share</p>
          <p className="text-xs text-gray-500 text-right">Click to Edit</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-6 border-blue-200 shadow-md">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          ⚙️ Cycle Configuration
        </h3>
        <Button variant="secondary" className="py-1 px-3 text-xs" onClick={() => setIsExpanded(false)}>
          Close
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
        <label className="block text-sm font-medium text-gray-700">Global Share Value (PHP)</label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={editingShareValue}
            onChange={(e) => setEditingShareValue(Number(e.target.value))}
            min={100}
            step={100}
          />
          <Button
            onClick={handleShareValueChange}
            disabled={editingShareValue === shareValue}>
            Update
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          This sets the base value for 1 Share. Changing this updates all target calculations immediately.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b pb-1">
          Member Share Declarations (January)
        </h4>
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
              <div>
                <p className="font-medium text-sm text-gray-800">{member.name}</p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Shares:</span>
                <input
                  type="number"
                  className="w-16 p-1 text-sm border rounded text-center focus:ring-blue-500 focus:border-blue-500"
                  value={member.numberOfShares}
                  min={1}
                  onChange={(e) => handleMemberShareChange(member.id, Number(e.target.value))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
