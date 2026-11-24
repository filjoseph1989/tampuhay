import 'dotenv/config';
import { Role, LoanType, TransactionType } from '@prisma/client';
import prisma from '../lib/prisma';

async function main() {
  console.log('🤖 Running database script to rollover past-due loans...');

  const activeCycle = await prisma.cycle.findFirst({
    where: { isActive: true },
    orderBy: { startDate: 'desc' }
  });

  if (!activeCycle) {
    console.error('❌ No active cycle found!');
    process.exit(1);
  }

  const cycleId = activeCycle.id;
  console.log(`ℹ️ Active Cycle ID: ${cycleId}`);

  const now = new Date();
  console.log(`ℹ️ Current date/time: ${now.toISOString()}`);

  const pastDueLoans = await prisma.loan.findMany({
    where: {
      status: 'ACTIVE',
      dueDate: {
        lt: now
      }
    },
    include: {
      member: true
    }
  });

  if (pastDueLoans.length === 0) {
    console.log('✅ No active loans are past due. Nothing to rollover.');
    return;
  }

  console.log(`Found ${pastDueLoans.length} past-due loans to roll over:`);
  for (const loan of pastDueLoans) {
    console.log(`- Loan ID: ${loan.id} | Member: ${loan.member.name} | Principal: ${loan.principal} | Due: ${loan.dueDate.toISOString()}`);
  }

  console.log('\nProcessing rollovers in transaction...');

  for (const loan of pastDueLoans) {
    const penalty = loan.principal * 0.05;
    const newPrincipal = loan.principal + penalty;
    
    // Set due date to 1 month from now
    const newDueDate = new Date();
    newDueDate.setMonth(newDueDate.getMonth() + 1);

    await prisma.$transaction(async (tx) => {
      // 1. Update old loan
      await tx.loan.update({
        where: { id: loan.id },
        data: {
          status: 'PAID',
          amountPaid: loan.principal
        }
      });

      // 2. Create new loan
      const newLoan = await tx.loan.create({
        data: {
          memberId: loan.memberId,
          type: 'STANDARD' as LoanType,
          principal: newPrincipal,
          interestRate: loan.interestRate,
          dueDate: newDueDate,
          status: 'ACTIVE',
          amountPaid: 0
        }
      });

      // 3. Record Interest Earned (penalty)
      await tx.transaction.create({
        data: {
          memberId: loan.memberId,
          type: 'INTEREST_EARNED' as TransactionType,
          amount: penalty,
          cycleId
        }
      });

      // 4. Record Rollover Transaction
      await tx.transaction.create({
        data: {
          memberId: loan.memberId,
          type: 'LOAN_ROLLOVER' as TransactionType,
          amount: newPrincipal,
          cycleId
        }
      });

      console.log(`✅ Rolled over loan ID ${loan.id} for ${loan.member.name}:`);
      console.log(`   Old Principal: ${loan.principal} -> New Principal: ${newPrincipal}`);
      console.log(`   New Loan ID: ${newLoan.id} | New Due Date: ${newDueDate.toISOString()}`);
    });
  }

  console.log('\n🎉 All past-due loans have been successfully rolled over!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing rollover script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
