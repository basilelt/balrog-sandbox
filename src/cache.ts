// Stub — replace with real Redis/Valkey client
export const cache = {
  get: async (_key: string): Promise<string | null> => null,
  set: async (_key: string, _value: string, _ttlSeconds: number): Promise<void> => {},
  del: async (_key: string): Promise<void> => {},
  expire: async (_key: string, _ttlSeconds: number): Promise<void> => {},
  keys: async (_pattern: string): Promise<string[]> => [],
}
