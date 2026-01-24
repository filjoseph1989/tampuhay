import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TransactionType, LoanType } from '@prisma/client';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'TREASURER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { memberId, amount } = body;

    if (!memberId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const activeCycle = await prisma.cycle.findFirst({
      where: { isActive: true },
      orderBy: { startDate: 'desc' }
    });
    const cycleId = activeCycle?.id || 1;

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1); // Due in 1 month

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Auto-Loan
      const loan = await tx.loan.create({
        data: {
          memberId: parseInt(memberId),
          type: 'AUTO_CONTRIBUTION' as LoanType,
          principal: parseFloat(amount),
          interestRate: 5, // 5% fixed
          dueDate: dueDate,
          status: 'ACTIVE',
          amountPaid: 0,
        }
      });

      // 2. Record Contribution (Pays off the share deficit)
      await tx.transaction.create({
        data: {
          memberId: parseInt(memberId),
          type: 'CONTRIBUTION' as TransactionType,
          amount: parseFloat(amount),
          cycleId,
        }
      });

      // Update member savings
      await tx.user.update({
        where: { id: parseInt(memberId) },
        data: { totalSaved: { increment: parseFloat(amount) } }
      });

      // 3. Record Disbursement (Money "leaves" pot to fund the share payment)
      await tx.transaction.create({
        data: {
          memberId: parseInt(memberId),
          type: 'LOAN_DISBURSEMENT' as TransactionType,
          amount: parseFloat(amount),
          cycleId,
        }
      });

      return loan;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error converting to auto-loan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
