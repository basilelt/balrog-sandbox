import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)
const SALT_BYTES = 16
const KEY_LEN = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString('hex')
  const hash = (await scryptAsync(password, salt, KEY_LEN)) as Buffer
  return `${salt}:${hash.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, storedHash] = stored.split(':')
  const hash = (await scryptAsync(password, salt, KEY_LEN)) as Buffer
  const storedBuffer = Buffer.from(storedHash, 'hex')
  return timingSafeEqual(hash, storedBuffer)
}
