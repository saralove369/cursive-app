import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_ID: 'cursive:user_id',
  DISPLAY_NAME: 'cursive:display_name',
  ONBOARDED: 'cursive:onboarded',
  LAST_OPEN: 'cursive:last_open',
} as const;

/**
 * Platform-aware storage. On web, AsyncStorage can hang during hydration —
 * fall back to a synchronous localStorage adapter wrapped in resolved promises.
 */
const platformStorage =
  Platform.OS === 'web'
    ? {
        getItem: async (key: string): Promise<string | null> => {
          try {
            return typeof window !== 'undefined' && window.localStorage
              ? window.localStorage.getItem(key)
              : null;
          } catch {
            return null;
          }
        },
        setItem: async (key: string, value: string): Promise<void> => {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem(key, value);
            }
          } catch {
            /* noop */
          }
        },
        removeItem: async (key: string): Promise<void> => {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.removeItem(key);
            }
          } catch {
            /* noop */
          }
        },
        multiRemove: async (keys: readonly string[]): Promise<void> => {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              keys.forEach((k) => window.localStorage.removeItem(k));
            }
          } catch {
            /* noop */
          }
        },
      }
    : AsyncStorage;

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const storage = {
  async getOrCreateUserId(): Promise<string> {
    const existing = await platformStorage.getItem(KEYS.USER_ID);
    if (existing) return existing;
    const id = uuid();
    await platformStorage.setItem(KEYS.USER_ID, id);
    return id;
  },
  async getUserId(): Promise<string | null> {
    return platformStorage.getItem(KEYS.USER_ID);
  },
  async setDisplayName(name: string): Promise<void> {
    await platformStorage.setItem(KEYS.DISPLAY_NAME, name);
  },
  async getDisplayName(): Promise<string | null> {
    return platformStorage.getItem(KEYS.DISPLAY_NAME);
  },
  async hasOnboarded(): Promise<boolean> {
    const v = await platformStorage.getItem(KEYS.ONBOARDED);
    return v === 'true';
  },
  async setOnboarded(): Promise<void> {
    await platformStorage.setItem(KEYS.ONBOARDED, 'true');
  },
  async clearAll(): Promise<void> {
    await platformStorage.multiRemove(Object.values(KEYS));
  },
  async setItem(key: string, value: string) {
    await platformStorage.setItem(key, value);
  },
  async getItem(key: string) {
    return platformStorage.getItem(key);
  },
};
