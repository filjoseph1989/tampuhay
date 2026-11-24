import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
  console.log('🤖 Starting database correction script for Charlotte...');

  await prisma.$transaction(async (tx) => {
    // 1. Update user record
    console.log('Updating user record for Charlotte (ID: 3)...');
    await tx.user.update({
      where: { id: 3 },
      data: {
        numberOfShares: 5,
        totalSaved: 5000,
      },
    });

    // 2. Update loans
    console.log('Updating Charlotte\'s loans...');
    
    // Initial auto-contribution loan
    await tx.loan.update({
      where: { id: 2 },
      data: {
        principal: 5000,
        amountPaid: 5000,
      },
    });

    // March 1 Rollover
    await tx.loan.update({
      where: { id: 15 },
      data: {
        principal: 5250,
        amountPaid: 5250,
      },
    });

    // April 9 Rollover
    await tx.loan.update({
      where: { id: 18 },
      data: {
        principal: 5512.5,
        amountPaid: 5512.5,
      },
    });

    // May 31 Rollover (active loan)
    await tx.loan.update({
      where: { id: 26 },
      data: {
        principal: 5788.125,
        amountPaid: 0,
      },
    });

    // 3. Update transactions
    console.log('Updating Charlotte\'s transactions...');

    // Transaction ID 3: CONTRIBUTION (Initial)
    await tx.transaction.update({
      where: { id: 3 },
      data: { amount: 5000 },
    });

    // Transaction ID 4: LOAN_DISBURSEMENT (Initial)
    await tx.transaction.update({
      where: { id: 4 },
      data: { amount: 5000 },
    });

    // Transaction ID 29: INTEREST_EARNED (March 1)
    await tx.transaction.update({
      where: { id: 29 },
      data: { amount: 250 },
    });

    // Transaction ID 30: LOAN_ROLLOVER (March 1)
    await tx.transaction.update({
      where: { id: 30 },
      data: { amount: 5250 },
    });

    // Transaction ID 35: INTEREST_EARNED (April 9)
    await tx.transaction.update({
      where: { id: 35 },
      data: { amount: 262.5 },
    });

    // Transaction ID 36: LOAN_ROLLOVER (April 9)
    await tx.transaction.update({
      where: { id: 36 },
      data: { amount: 5512.5 },
    });

    // Transaction ID 51: INTEREST_EARNED (May 31)
    await tx.transaction.update({
      where: { id: 51 },
      data: { amount: 275.625 },
    });

    // Transaction ID 52: LOAN_ROLLOVER (May 31)
    await tx.transaction.update({
      where: { id: 52 },
      data: { amount: 5788.125 },
    });
  });

  console.log('🎉 Database correction and rollover recalculation successful!');
}

main()
  .catch((e) => {
    console.error('❌ Error updating database records:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
