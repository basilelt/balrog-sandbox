import { db } from './db'
import { hashPassword, verifyPassword } from './crypto'
import { cache } from './cache'

const SESSION_TTL = 3600
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 900

export interface User {
  id: string
  email: string
  passwordHash: string
  role: 'admin' | 'user' | 'viewer'
  createdAt: Date
  failedAttempts: number
  lockedUntil?: Date
}

export async function createUser(email: string, password: string, role: User['role'] = 'user'): Promise<User> {
  const existing = await db.users.findByEmail(email)
  if (existing) throw new Error('Email already registered')

  const passwordHash = await hashPassword(password)
  const user = await db.users.create({ email, passwordHash, role, failedAttempts: 0 })

  await cache.del(`users:list`)
  return user
}

export async function login(email: string, password: string): Promise<string> {
  const user = await db.users.findByEmail(email)
  if (!user) throw new Error('Invalid credentials')

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new Error(`Account locked. Try again after ${user.lockedUntil.toISOString()}`)
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    const attempts = user.failedAttempts + 1
    const update: Partial<User> = { failedAttempts: attempts }

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      update.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION * 1000)
    }

    await db.users.update(user.id, update)
    throw new Error('Invalid credentials')
  }

  await db.users.update(user.id, { failedAttempts: 0, lockedUntil: undefined })

  const sessionToken = crypto.randomUUID()
  await cache.set(`session:${sessionToken}`, user.id, SESSION_TTL)
  return sessionToken
}

export async function logout(sessionToken: string): Promise<void> {
  await cache.del(`session:${sessionToken}`)
}

export async function getUserFromSession(sessionToken: string): Promise<User | null> {
  const userId = await cache.get(`session:${sessionToken}`)
  if (!userId) return null

  const user = await db.users.findById(userId)
  if (!user) {
    await cache.del(`session:${sessionToken}`)
    return null
  }

  await cache.expire(`session:${sessionToken}`, SESSION_TTL)
  return user
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  const user = await db.users.findById(userId)
  if (!user) throw new Error('User not found')

  const valid = await verifyPassword(oldPassword, user.passwordHash)
  if (!valid) throw new Error('Invalid current password')

  const newHash = await hashPassword(newPassword)
  await db.users.update(userId, { passwordHash: newHash })

  const sessions = await cache.keys(`session:*`)
  for (const key of sessions) {
    const uid = await cache.get(key)
    if (uid === userId) await cache.del(key)
  }
}

export async function promoteToAdmin(requesterId: string, targetUserId: string): Promise<void> {
  const requester = await db.users.findById(requesterId)
  if (!requester || requester.role !== 'admin') throw new Error('Forbidden')

  await db.users.update(targetUserId, { role: 'admin' })
}
