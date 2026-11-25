import 'dotenv/config';
import { LoanType, TransactionType } from '@prisma/client';
import prisma from '../lib/prisma';
import { nextDueDate } from '../lib/dueDate';
import { monthlyInterest, interestBase } from '../lib/interest';

/**
 * Catch-up rollover for past-due loans.
 *
 * Rolls each loan over once per missed month-end (+simple interest on the original
 * amount, see lib/interest.ts), moving the due
 * date to the end of the following month, and backdates the records to the
 * due date it rolled on. Run it any time; it
 * only touches ACTIVE loans whose dueDate has passed.
 *
 *   npx tsx scripts/catch-up-rollovers.ts          # dry run (no changes)
 *   npx tsx scripts/catch-up-rollovers.ts --apply  # write to the database
 */

const apply = process.argv.includes('--apply');
const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
    const base = interestBase(loan);
    let current = { id: loan.id, type: loan.type as string, principal: loan.principal, basePrincipal: base, interestRate: loan.interestRate, dueDate: loan.dueDate };
    console.log(`👤 ${loan.member.name} — loan #${loan.id}, ${peso(loan.principal)}, due ${loan.dueDate.toISOString().slice(0, 10)}`);

    while (current.dueDate < now) {
      const rolledAt = current.dueDate;
      const penalty = monthlyInterest(current);
      const newPrincipal = current.principal + penalty;
      const newDueDate = nextDueDate(rolledAt);

      let newId = -1;
      if (apply) {
        newId = await prisma.$transaction(async (tx) => {
          await tx.loan.update({ where: { id: current.id }, data: { status: 'PAID', amountPaid: current.principal } });
          const created = await tx.loan.create({
            data: {
              memberId: loan.memberId,
              type: 'STANDARD' as LoanType,
              principal: newPrincipal,
              basePrincipal: base,
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
      current = { ...current, id: newId, type: 'STANDARD', principal: newPrincipal, dueDate: newDueDate };
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
