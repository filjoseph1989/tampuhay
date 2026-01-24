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
    const { loanId } = body;

    if (!loanId) {
      return NextResponse.json({ error: 'Missing loanId' }, { status: 400 });
    }

    const activeCycle = await prisma.cycle.findFirst({
      where: { isActive: true },
      orderBy: { startDate: 'desc' }
    });
    const cycleId = activeCycle?.id || 1;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch old loan
      const oldLoan = await tx.loan.findUnique({
        where: { id: parseInt(loanId) }
      });

      if (!oldLoan) throw new Error('Loan not found');

      const penalty = oldLoan.principal * 0.05;
      const newPrincipal = oldLoan.principal + penalty;
      const newDueDate = new Date();
      newDueDate.setMonth(newDueDate.getMonth() + 1);

      // 2. Mark old loan as PAID
      await tx.loan.update({
        where: { id: parseInt(loanId) },
        data: { status: 'PAID', amountPaid: oldLoan.principal } // Assume full principal settled via refinance
      });

      // 3. Create New Loan
      const newLoan = await tx.loan.create({
        data: {
          memberId: oldLoan.memberId,
          type: 'STANDARD' as LoanType,
          principal: newPrincipal,
          interestRate: oldLoan.interestRate,
          dueDate: newDueDate,
          status: 'ACTIVE',
          amountPaid: 0,
        }
      });

      // 4. Record Penalty as Interest Earned
      await tx.transaction.create({
        data: {
          memberId: oldLoan.memberId,
          type: 'INTEREST_EARNED' as TransactionType,
          amount: penalty,
          cycleId,
        }
      });

      // 5. Record Rollover Event
      await tx.transaction.create({
        data: {
          memberId: oldLoan.memberId,
          type: 'LOAN_ROLLOVER' as TransactionType,
          amount: newPrincipal,
          cycleId,
        }
      });

      return newLoan;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error rolling over loan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
