import { Role } from '@prisma/client'
import { hash } from 'bcryptjs'
import prisma from '../lib/prisma'

async function main() {
  console.log('🌱 Seeding database...')

  const password = await hash('password123', 12)

  // 1. Create a Default Cycle
  const cycle = await prisma.cycle.upsert({
    where: { id: 1 },
    update: {},
    create: {
      startDate: new Date(),
      targetPayoutDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      shareValue: 1000,
      isActive: true,
    },
  })
  console.log(`✅ Created cycle: ${cycle.id}`)

  // 2. Create Mock Members
  const mockMembers = [
    { id: 1, name: 'treasurer', email: 'treasurer@example.com', role: Role.TREASURER },
    { id: 2, name: 'ailene', email: 'ailene@example.com', role: Role.KABERK },
    { id: 3, name: 'bernard', email: 'bernard@example.com', role: Role.KABERK },
    { id: 4, name: 'charlotte', email: 'charlotte@example.com', role: Role.KABERK },
    { id: 5, name: 'connie', email: 'connie@example.com', role: Role.KABERK },
    { id: 6, name: 'fil', email: 'fil@example.com', role: Role.KABERK },
    { id: 7, name: 'leslie', email: 'leslie@example.com', role: Role.KABERK },
    { id: 8, name: 'rejean', email: 'rejean@example.com', role: Role.KABERK },
    { id: 9, name: 'rodelyn', email: 'rodelyn@example.com', role: Role.KABERK },
    { id: 10, name: 'romel', email: 'romel@example.com', role: Role.KABERK },
    { id: 11, name: 'ronald', email: 'ronald@example.com', role: Role.MEMBER },
  ]

  for (const member of mockMembers) {
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: {
        name: member.name,
        role: member.role,
        password,
      },
      create: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        password,
        totalSaved: 0,
        numberOfShares: 0,
      },
    })
    console.log(`👤 Created/Updated user: ${user.name}`)
  }

  console.log('✅ Seeding finished successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })