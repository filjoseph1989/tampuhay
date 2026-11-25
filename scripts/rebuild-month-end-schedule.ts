import 'dotenv/config';
import { LoanType, TransactionType } from '@prisma/client';
import prisma from '../lib/prisma';
import { endOfMonthPH, nextDueDate } from '../lib/dueDate';
import { monthlyInterest } from '../lib/interest';

/**
 * One-time rebuild of every member's rollover history on a month-end schedule.
 *
 * Starting from each member's original AUTO_CONTRIBUTION loan, deletes the
 * existing STANDARD rollover loans and their INTEREST_EARNED / LOAN_ROLLOVER
 * transactions, then re-creates them: one rollover at the end of every month
 * that has passed, each due at the end of the following month. Interest follows
 * lib/interest.ts (simple interest on the original amount; first month free).
 *
 * Only safe while members have made no loan payments (it refuses otherwise).
 *
 *   npx tsx scripts/rebuild-month-end-schedule.ts          # dry run
 *   npx tsx scripts/rebuild-month-end-schedule.ts --apply  # write
 */

const apply = process.argv.includes('--apply');
const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (d: Date) => d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'short', day: 'numeric' });

async function main() {
  const now = new Date();
  console.log(`${apply ? '✍️  APPLY' : '👀 DRY RUN'} — now: ${day(now)}\n`);

  const payments = await prisma.transaction.count({ where: { type: 'LOAN_PAYMENT' } });
  if (payments > 0) throw new Error(`Found ${payments} LOAN_PAYMENT transactions; rebuild would ignore them. Aborting.`);

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true }, orderBy: { startDate: 'desc' } });
  if (!activeCycle) throw new Error('No active cycle found');

  const seeds = await prisma.loan.findMany({
    where: { type: 'AUTO_CONTRIBUTION' },
    include: { member: true },
    orderBy: { memberId: 'asc' },
  });

  for (const seed of seeds) {
    const firstDue = endOfMonthPH(seed.startDate); // due at the end of the month the loan started
    const steps: { rolledAt: Date; penalty: number; principal: number; due: Date }[] = [];
    let principal = seed.principal;
    let due = firstDue;
    let link = { type: seed.type as string, principal, basePrincipal: seed.principal, interestRate: seed.interestRate };
    while (due < now) {
      const penalty = monthlyInterest(link);
      principal += penalty;
      const next = nextDueDate(due);
      steps.push({ rolledAt: due, penalty, principal, due: next });
      link = { ...link, type: 'STANDARD', principal };
      due = next;
    }

    console.log(`👤 ${seed.member.name} — start ${peso(seed.principal)}, first due ${day(firstDue)}`);
    for (const s of steps) console.log(`   ↻ ${day(s.rolledAt)}: +${peso(s.penalty)} → ${peso(s.principal)} (due ${day(s.due)})`);
    console.log('');

    if (!apply) continue;

    await prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { memberId: seed.memberId, type: { in: ['INTEREST_EARNED', 'LOAN_ROLLOVER'] } },
      });
      await tx.loan.deleteMany({ where: { memberId: seed.memberId, type: 'STANDARD' } });
      await tx.loan.update({
        where: { id: seed.id },
        data: steps.length
          ? { dueDate: firstDue, basePrincipal: seed.principal, status: 'PAID', amountPaid: seed.principal }
          : { dueDate: firstDue, basePrincipal: seed.principal, status: 'ACTIVE', amountPaid: 0 },
      });

      let prevPrincipal = seed.principal;
      for (const [i, s] of steps.entries()) {
        const isLast = i === steps.length - 1;
        await tx.loan.create({
          data: {
            memberId: seed.memberId,
            type: 'STANDARD' as LoanType,
            principal: s.principal,
            basePrincipal: seed.principal,
            interestRate: seed.interestRate,
            startDate: s.rolledAt,
            dueDate: s.due,
            status: isLast ? 'ACTIVE' : 'PAID',
            amountPaid: isLast ? 0 : s.principal,
          },
        });
        await tx.transaction.createMany({
          data: [
            ...(s.penalty > 0
              ? [{ memberId: seed.memberId, type: 'INTEREST_EARNED' as TransactionType, amount: s.principal - prevPrincipal, cycleId: activeCycle.id, date: s.rolledAt }]
              : []),
            { memberId: seed.memberId, type: 'LOAN_ROLLOVER' as TransactionType, amount: s.principal, cycleId: activeCycle.id, date: s.rolledAt },
          ],
        });
        prevPrincipal = s.principal;
      }
    });
  }

  console.log(apply ? '🎉 Rebuilt.' : 'ℹ️  Dry run only. Re-run with --apply to save.');
}

main()
  .catch((e) => {
    console.error('❌', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
