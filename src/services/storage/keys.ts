// Storage keys for MMKV
export const StorageKeys = {
  // App settings
  THEME_MODE: 'theme_mode',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  
  // User preferences
  USER_PREFERENCES: 'user_preferences',
  
  // AI-related (placeholder for future use)
  AI_MODELS: 'ai_models',
  AI_HISTORY: 'ai_history',
  AI_SETTINGS: 'ai_settings',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
