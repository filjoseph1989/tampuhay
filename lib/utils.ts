import { Member } from '../types';

export const getMemberName = (members: Member[], id: string) => {
  const member = members.find((m) => m.id === id);
  return member ? member.name : 'unknown member';
};
