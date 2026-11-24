import 'dotenv/config';
import { LoanType, TransactionType } from '@prisma/client';
import prisma from '../lib/prisma';

/**
 * Catch-up rollover for past-due loans.
 *
 * Unlike rollover-past-due.ts (which sets the new due date to "1 month from now"),
 * this rolls each loan over once per missed month, anchored on the loan's own
 * due date, and backdates the records to that due date. Run it any time; it
 * only touches ACTIVE loans whose dueDate has passed.
 *
 *   npx tsx scripts/catch-up-rollovers.ts          # dry run (no changes)
 *   npx tsx scripts/catch-up-rollovers.ts --apply  # write to the database
 */

const PENALTY_RATE = 0.05;
const apply = process.argv.includes('--apply');
const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function addMonth(d: Date) {
  const next = new Date(d);
  next.setMonth(next.getMonth() + 1);
  return next;
}

async function main() {
  const now = new Date();
  console.log(`${apply ? '✍️  APPLY' : '👀 DRY RUN'} — now: ${now.toISOString()}\n`);

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true }, orderBy: { startDate: 'desc' } });
  if (!activeCycle) throw new Error('No active cycle found');

  const loans = await prisma.loan.findMany({
    where: { status: 'ACTIVE', dueDate: { lt: now } },
    include: { member: true },
    orderBy: { memberId: 'asc' },
  });

  if (loans.length === 0) {
    console.log('✅ No past-due loans. Nothing to catch up.');
    return;
  }

  for (const loan of loans) {
    let current = { id: loan.id, principal: loan.principal, dueDate: loan.dueDate };
    console.log(`👤 ${loan.member.name} — loan #${loan.id}, ${peso(loan.principal)}, due ${loan.dueDate.toISOString().slice(0, 10)}`);

    while (current.dueDate < now) {
      const rolledAt = current.dueDate;
      const penalty = current.principal * PENALTY_RATE;
      const newPrincipal = current.principal + penalty;
      const newDueDate = addMonth(rolledAt);

      let newId = -1;
      if (apply) {
        newId = await prisma.$transaction(async (tx) => {
          await tx.loan.update({ where: { id: current.id }, data: { status: 'PAID', amountPaid: current.principal } });
          const created = await tx.loan.create({
            data: {
              memberId: loan.memberId,
              type: 'STANDARD' as LoanType,
              principal: newPrincipal,
              interestRate: loan.interestRate,
              startDate: rolledAt,
              dueDate: newDueDate,
              status: 'ACTIVE',
              amountPaid: 0,
            },
          });
          await tx.transaction.createMany({
            data: [
              { memberId: loan.memberId, type: 'INTEREST_EARNED' as TransactionType, amount: penalty, cycleId: activeCycle.id, date: rolledAt },
              { memberId: loan.memberId, type: 'LOAN_ROLLOVER' as TransactionType, amount: newPrincipal, cycleId: activeCycle.id, date: rolledAt },
            ],
          });
          return created.id;
        });
      }

      console.log(`   ↻ ${rolledAt.toISOString().slice(0, 10)}: +${peso(penalty)} → ${peso(newPrincipal)} (due ${newDueDate.toISOString().slice(0, 10)})${apply ? ` [loan #${newId}]` : ''}`);
      current = { id: newId, principal: newPrincipal, dueDate: newDueDate };
    }
    console.log('');
  }

  console.log(apply ? '🎉 Done.' : 'ℹ️  Dry run only. Re-run with --apply to save.');
}

main()
  .catch((e) => {
    console.error('❌', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
