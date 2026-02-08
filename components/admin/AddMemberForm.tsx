import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AddMemberFormProps {
  addMember: (memberData: {
    name: string;
    email?: string;
    role: string;
    numberOfShares: number;
  }) => Promise<void>;
}

export default function AddMemberForm({ addMember }: AddMemberFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'MEMBER',
    numberOfShares: '1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      await addMember({
        name: formData.name,
        email: formData.email || undefined,
        role: formData.role,
        numberOfShares: parseInt(formData.numberOfShares) || 0,
      });

      setFormData({
        name: '',
        email: '',
        role: 'MEMBER',
        numberOfShares: '1',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-bold mb-4 text-gray-700">Add New Member</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Juan Dela Cruz"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          type="email"
          label="Email Address (Optional)"
          placeholder="juan@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          as="select"
          label="Role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required>
          <option value="MEMBER">Member</option>
          <option value="KABERK">Kaberk</option>
          <option value="TREASURER">Treasurer</option>
        </Input>

        <Input
          type="number"
          label="Number of Shares"
          placeholder="1"
          value={formData.numberOfShares}
          onChange={(e) => setFormData({ ...formData, numberOfShares: e.target.value })}
          required
          min="1"
        />

        <Button 
          type="submit" 
          fullWidth 
          className="mt-4 cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding Member...' : 'Add Member'}
        </Button>
      </form>
    </Card>
  );
}
