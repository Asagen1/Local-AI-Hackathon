import { createMMKV } from 'react-native-mmkv';

// Initialize MMKV storage
const storage = createMMKV();

// Type-safe storage service
export const storageService = {
  // String operations
  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },

  setString: (key: string, value: string): void => {
    storage.set(key, value);
  },

  // Boolean operations
  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },

  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  // Number operations
  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  // Object operations (JSON)
  getObject: <T>(key: string): T | undefined => {
    const value = storage.getString(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  },

  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  // Delete operations
  delete: (key: string): void => {
    storage.remove(key);
  },

  // Clear all
  clearAll: (): void => {
    storage.clearAll();
  },

  // Check if key exists
  contains: (key: string): boolean => {
    return storage.contains(key);
  },
};

// Export storage instance if needed directly
export { storage };


