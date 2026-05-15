import { User } from './userService'

// Stub — replace with real DB client (pg, prisma, drizzle...)
export const db = {
  users: {
    findByEmail: async (_email: string): Promise<User | null> => null,
    findById: async (_id: string): Promise<User | null> => null,
    create: async (_data: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
      throw new Error('not implemented')
    },
    update: async (_id: string, _data: Partial<User>): Promise<void> => {},
  },
}
