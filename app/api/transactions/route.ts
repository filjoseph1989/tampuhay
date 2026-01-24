import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TransactionType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'TREASURER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { memberId, amount, type, date, cycleId } = body;

    // Simple validation
    if (!memberId || !amount || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get active cycle if not provided
    let effectiveCycleId = cycleId ? parseInt(cycleId) : null;
    if (!effectiveCycleId) {
      const activeCycle = await prisma.cycle.findFirst({
        where: { isActive: true },
        orderBy: { startDate: 'desc' }
      });
      effectiveCycleId = activeCycle?.id || 1;
    }

    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create the transaction
      const newTx = await tx.transaction.create({
        data: {
          memberId: parseInt(memberId),
          amount: parseFloat(amount),
          type: type as TransactionType,
          date: date ? new Date(date) : new Date(),
          cycleId: effectiveCycleId,
        },
      });

      // 2. Update Member Savings if it's a CONTRIBUTION
      if (type === 'CONTRIBUTION') {
        await tx.user.update({
          where: { id: parseInt(memberId) },
          data: {
            totalSaved: {
              increment: parseFloat(amount),
            },
          },
        });
      }

      return newTx;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
