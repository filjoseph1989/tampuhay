import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateLoan } from '@/lib/loanCalculator';
import { TransactionType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'TREASURER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const loanId = parseInt(id);
    const body = await request.json();
    const { action, amount } = body;

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { member: true },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Get active cycle
    const activeCycle = await prisma.cycle.findFirst({
      where: { isActive: true },
      orderBy: { startDate: 'desc' }
    });
    const effectiveCycleId = activeCycle?.id || 1;

    if (action === 'APPROVE') {
      const { netProceeds, interest } = calculateLoan(
        loan.principal,
        loan.interestRate,
        loan.member.role
      );

      const updatedLoan = await prisma.$transaction(async (tx) => {
        // 1. Update loan status
        const l = await tx.loan.update({
          where: { id: loanId },
          data: { status: 'ACTIVE' },
        });

        // 2. Disbursement Transaction
        await tx.transaction.create({
          data: {
            memberId: loan.memberId,
            type: 'LOAN_DISBURSEMENT' as TransactionType,
            amount: netProceeds,
            cycleId: effectiveCycleId,
          },
        });

        // 3. Interest Transaction
        await tx.transaction.create({
          data: {
            memberId: loan.memberId,
            type: 'INTEREST_EARNED' as TransactionType,
            amount: interest,
            cycleId: effectiveCycleId,
          },
        });

        return l;
      });

      return NextResponse.json(updatedLoan);
    }

    if (action === 'REPAY') {
      if (!amount) return NextResponse.json({ error: 'Amount required' }, { status: 400 });

      const newAmountPaid = loan.amountPaid + parseFloat(amount);
      const isFullyPaid = newAmountPaid >= loan.principal;

      const updatedLoan = await prisma.$transaction(async (tx) => {
        const l = await tx.loan.update({
          where: { id: loanId },
          data: {
            amountPaid: newAmountPaid,
            status: isFullyPaid ? 'PAID' : 'ACTIVE',
          },
        });

        await tx.transaction.create({
          data: {
            memberId: loan.memberId,
            type: 'LOAN_PAYMENT' as TransactionType,
            amount: parseFloat(amount),
            cycleId: effectiveCycleId,
          },
        });

        return l;
      });

      return NextResponse.json(updatedLoan);
    }

    if (action === 'REJECT') {
      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json(updatedLoan);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
