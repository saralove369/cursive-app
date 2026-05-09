import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_ID: 'cursive:user_id',
  DISPLAY_NAME: 'cursive:display_name',
  ONBOARDED: 'cursive:onboarded',
  LAST_OPEN: 'cursive:last_open',
} as const;

function uuid(): string {
  // RFC4122-ish v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const storage = {
  async getOrCreateUserId(): Promise<string> {
    const existing = await AsyncStorage.getItem(KEYS.USER_ID);
    if (existing) return existing;
    const id = uuid();
    await AsyncStorage.setItem(KEYS.USER_ID, id);
    return id;
  },
  async getUserId(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.USER_ID);
  },
  async setDisplayName(name: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.DISPLAY_NAME, name);
  },
  async getDisplayName(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.DISPLAY_NAME);
  },
  async hasOnboarded(): Promise<boolean> {
    const v = await AsyncStorage.getItem(KEYS.ONBOARDED);
    return v === 'true';
  },
  async setOnboarded(): Promise<void> {
    await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
  },
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async getItem(key: string) {
    return AsyncStorage.getItem(key);
  },
};
