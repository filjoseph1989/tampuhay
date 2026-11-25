import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateLoan } from '@/lib/loanCalculator';
import { TransactionType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { monthlyInterest } from '@/lib/interest';

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
    const { action, amount, date } = body;

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
      const { netProceeds } = calculateLoan(
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

        // 2. Disbursement Transaction (Full Amount)
        await tx.transaction.create({
          data: {
            memberId: loan.memberId,
            type: 'LOAN_DISBURSEMENT' as TransactionType,
            amount: netProceeds,
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
      
      // Recalculate total owed based on role
      const effectiveRate = (loan.member.role === 'KABERK' || loan.member.role === 'TREASURER') ? loan.interestRate : 10;
      const interest = monthlyInterest(loan, effectiveRate);
      const totalOwed = loan.principal + interest;
      
      const isFullyPaid = newAmountPaid >= totalOwed;

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
            date: date ? new Date(date) : new Date(),
            cycleId: effectiveCycleId,
          },
        });

        // If fully paid, record the interest earned separately?
        // Current logic: LOAN_PAYMENT increases pot.
        // Disbursement decreased pot.
        // Net effect = Interest.
        // So we don't strictly need a separate INTEREST_EARNED transaction unless we want specific reporting.
        // For now, simple Pot tracking works.

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
