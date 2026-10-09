import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

const SETUP_COMPLETE_KEY = 'setup_complete';
const PARAMETERS_KEY = 'chart_parameters';

export type ParamType = 'text' | 'number' | 'date' | 'choice';

export type Parameter = {
  id: string;
  label: string;
  type: ParamType;
  options?: string[];
  isDefault: boolean;
};

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

export function saveParameters(parameters: Parameter[]): void {
  console.log('saveParameters called with:', parameters.length, 'parameters');
  storage.set(PARAMETERS_KEY, JSON.stringify(parameters));
}

export function loadParameters(): Parameter[] | null {
  const json = storage.getString(PARAMETERS_KEY);
  if (json) {
    try {
      const parsed = JSON.parse(json);
      console.log('loadParameters: loaded', parsed.length, 'parameters');
      return parsed;
    } catch (error) {
      console.error('Failed to parse parameters:', error);
      return null;
    }
  }
  console.log('loadParameters: no saved parameters');
  return null;
}
