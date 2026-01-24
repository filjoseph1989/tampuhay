import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cycle = await prisma.cycle.findFirst({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
    });
    return NextResponse.json(cycle);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'TREASURER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { shareValue } = body;

    const cycle = await prisma.cycle.findFirst({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
    });

    if (!cycle) {
      return NextResponse.json({ error: 'No active cycle' }, { status: 404 });
    }

    const updatedCycle = await prisma.cycle.update({
      where: { id: cycle.id },
      data: {
        shareValue: parseFloat(shareValue),
      },
    });

    return NextResponse.json(updatedCycle);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
