import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const loans = await prisma.loan.findMany({
      orderBy: {
        startDate: 'desc',
      },
    });
    return NextResponse.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, principal, interestRate, dueDate, type } = body;

    if (!memberId || !principal || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const loan = await prisma.loan.create({
      data: {
        memberId,
        type: type || 'STANDARD',
        principal: parseFloat(principal),
        interestRate: parseFloat(interestRate || '5'),
        dueDate: new Date(dueDate),
        status: 'PENDING',
        amountPaid: 0,
      },
    });

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
