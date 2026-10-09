# Coding Conventions

## TypeScript

### Naming Conventions
- **Components**: PascalCase (`HomeScreen.tsx`, `DataList.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAppStore.ts`)
- **Services**: camelCase (`apiClient.ts`, `storageService.ts`)
- **Types**: PascalCase (`UserData`, `RootStackParamList`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `StorageKeys.USER_TOKEN`)

### File Structure
```tsx
// 1. Imports (grouped: external, internal, types)
import React from 'react';
import { View, Text } from 'react-native';
import { useAppStore } from '@hooks';
import type { User } from '@types';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component
export default function MyComponent({ title }: Props) {
  return <View><Text>{title}</Text></View>;
}

// 4. Styles (if not using NativeWind)
```

### Type Definitions
- Always define prop types
- Use interfaces for objects
- Use type for unions/intersections
- Export types that other files need

```tsx
// Good
interface UserData {
  id: string;
  name: string;
}

// Good
type Status = 'idle' | 'loading' | 'success' | 'error';
```

## React Native

### Components
- Use functional components
- Prefer hooks over class components
- Keep components small (< 200 lines)
- Extract complex logic into hooks

### Styling with NativeWind
```tsx
// Good - Use Tailwind classes
<View className="flex-1 bg-white p-4">
  <Text className="text-xl font-bold">Title</Text>
</View>

// Avoid - Inline styles (unless dynamic)
<View style={{ flex: 1, backgroundColor: 'white' }}>
  <Text style={{ fontSize: 20 }}>Title</Text>
</View>
```

### Performance
```tsx
// Good - Use FlashList
import { FlashList } from '@shopify/flash-list';
<FlashList data={items} renderItem={renderItem} estimatedItemSize={80} />

// Avoid - FlatList for long lists
<FlatList data={items} renderItem={renderItem} />
```

## State Management

### Zustand Store Pattern
```tsx
import { create } from 'zustand';

interface StoreState {
  // State
  count: number;
  // Actions
  increment: () => void;
}

export const useStore = create<StoreState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### React Query Pattern
```tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@services/api';

export function useUserData(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.get(`/users/${userId}`),
  });
}
```

## Storage

### MMKV Usage
```tsx
import { storageService, StorageKeys } from '@services/storage';

// Good - Use service wrapper
storageService.setObject(StorageKeys.USER_DATA, userData);
const user = storageService.getObject<UserData>(StorageKeys.USER_DATA);

// Good - Define keys in StorageKeys constant
export const StorageKeys = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
} as const;
```

## Navigation

### Type-Safe Navigation
```tsx
// In types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
};

// In component
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function MyComponent() {
  const navigation = useNavigation<NavigationProp>();
  
  navigation.navigate('Profile', { userId: '123' }); // Type-safe!
}
```

## Import Aliases

Always use path aliases:
```tsx
// Good
import { Button } from '@components/common';
import { HomeScreen } from '@screens';
import { apiClient } from '@services/api';

// Avoid
import { Button } from '../../components/common/Button';
import { HomeScreen } from '../screens/HomeScreen';
```

## Comments

### When to Comment
- Complex algorithms
- Non-obvious business logic
- Workarounds for bugs
- TODO items

```tsx
// Good - Explains WHY
// Using setTimeout because the animation needs to complete before navigation
setTimeout(() => navigation.goBack(), 300);

// Avoid - Explains WHAT (code is self-explanatory)
// Set the user name
setUserName('John');
```

### JSDoc for Functions
```tsx
/**
 * Fetches user data from the API
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to user data
 */
async function fetchUser(userId: string): Promise<UserData> {
  return apiClient.get(`/users/${userId}`);
}
```

## Error Handling

```tsx
// Good - Specific error handling
try {
  const data = await apiClient.get('/endpoint');
  return data;
} catch (error) {
  if (error instanceof NetworkError) {
    showToast('No internet connection');
  } else {
    showToast('Something went wrong');
  }
  console.error('API Error:', error);
}

// Good - Error boundaries for components
<ErrorBoundary fallback={<ErrorScreen />}>
  <MyComponent />
</ErrorBoundary>
```

## Code Organization

### Component File Size
- < 100 lines: Perfect
- 100-200 lines: Good
- 200-300 lines: Consider splitting
- \> 300 lines: Definitely split

### Extract When:
1. Logic is reused multiple times
2. Component becomes hard to read
3. Clear separation of concerns exists

## Git Commits

### Commit Messages
```
feat: add user profile screen
fix: resolve storage key collision
refactor: extract API client
docs: update README with setup steps
chore: upgrade dependencies
```

### Commit Often
- Small, focused commits
- One feature/fix per commit
- Commit working code

## Testing Strategy

### Manual Testing
1. Test on actual device
2. Test both orientations (if supporting landscape)
3. Test with slow network
4. Test with no network
5. Test on different Android versions

### What to Test
- Happy path flows
- Error states
- Loading states
- Empty states
- Edge cases
