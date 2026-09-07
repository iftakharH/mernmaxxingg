import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hash } from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = 'admin@mernmaxxingg.com'
  const adminPassword = 'Admin123!'

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existing) {
    console.log('Admin user already exists:', adminEmail)
    process.exit(0)
  }

  const hashedPassword = await hash(adminPassword, 12)

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      onboardingCompleted: true,
    },
  })

  console.log('Admin user created successfully!')
  console.log('Email:', adminEmail)
  console.log('Password:', adminPassword)
  console.log('Role: ADMIN')
}

main()
  .catch((e) => {
    console.error('Error creating admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
