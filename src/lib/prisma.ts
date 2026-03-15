import { PrismaClient } from '@prisma/client'

// Prevent multiple PrismaClient instances in development.
// When ts-node reloads modules during development, a new PrismaClient would be
// created on every reload — potentially exhausting the database connection pool.
// Storing the instance on globalThis ensures it's reused across reloads.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'], // log all queries in development
  })

// Only cache the instance outside of production
// (in production the process never reloads, so this isn't needed)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}