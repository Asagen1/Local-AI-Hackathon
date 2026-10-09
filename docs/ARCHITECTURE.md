# Project Architecture

## Overview
This project follows a feature-based architecture with clear separation of concerns.

## Core Principles

1. **Type Safety First**: Strict TypeScript everywhere
2. **Component Composition**: Small, reusable components
3. **State Colocalization**: Keep state close to where it's used
4. **Path Aliases**: Clean imports with `@` prefix
5. **Performance**: MMKV for storage, FlashList for lists

## Data Flow

```
User Action → Component → Hook/Store → Service → Storage/API
                ↓                                      ↓
            UI Update ← State Update ← Response ← Data
```

## Folder Responsibilities

### `/src/components`
- **common/**: Reusable UI components (buttons, cards, lists)
- **features/**: Feature-specific components

### `/src/screens`
- Full-screen components
- Connected to navigation
- Compose smaller components

### `/src/navigation`
- Navigation structure
- Route definitions
- Type-safe navigation

### `/src/services`
- **api/**: HTTP client, API calls
- **storage/**: MMKV wrapper, persistence

### `/src/hooks`
- Custom hooks
- Zustand stores
- Shared logic

### `/src/utils`
- Pure functions
- Helpers
- Formatters

### `/src/types`
- TypeScript interfaces
- Type definitions
- Navigation types

### `/src/constants`
- App-wide constants
- Theme colors
- Configuration

## State Management Strategy

### Zustand (Global State)
Use for:
- User authentication state
- App-wide settings
- Theme preferences
- Persistent UI state

### React Query (Server State)
Use for:
- API data fetching
- Caching
- Background updates
- Optimistic updates

### Local State (useState)
Use for:
- Form inputs
- UI toggles
- Component-specific state

## Storage Strategy

### MMKV
- Fast synchronous storage
- Type-safe wrapper in `@services/storage`
- Automatic serialization for objects
- Centralized keys in `StorageKeys`

## Performance Considerations

1. **Lists**: Always use FlashList, not FlatList
2. **Images**: Use proper image optimization
3. **Re-renders**: Use React.memo for expensive components
4. **Storage**: MMKV is synchronous and fast
5. **Navigation**: Use screen options to prevent unnecessary renders

## Development Workflow

1. **Plan**: Define types and interfaces first
2. **Build**: Create components bottom-up
3. **Connect**: Wire up state and navigation
4. **Test**: Manual testing on device
5. **Iterate**: Refine based on feedback

## AI-Assisted Development Tips

1. Be explicit about types
2. Use descriptive variable names
3. Add inline comments for complex logic
4. Keep functions small and focused
5. Export everything that might be reused
