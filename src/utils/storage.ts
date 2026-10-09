import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

const SETUP_COMPLETE_KEY = 'setup_complete';

export function isSetupComplete(): boolean {
  const value = storage.getBoolean(SETUP_COMPLETE_KEY) ?? false;
  console.log('isSetupComplete:', value); // Debug log
  return value;
}

export function markSetupComplete(): void {
  console.log('markSetupComplete called'); // Debug log
  storage.set(SETUP_COMPLETE_KEY, true);
}

export function clearSetup(): void {
  console.log('clearSetup called'); // Debug log
  storage.remove(SETUP_COMPLETE_KEY);
}
