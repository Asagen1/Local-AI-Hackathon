# API Integration Guide

## Setup

API client is configured in `src/services/api/client.ts`.

## Basic Usage

```tsx
import { apiClient } from '@services/api';

// GET
const users = await apiClient.get('/users');

// POST
const newUser = await apiClient.post('/users', {
  name: 'John',
  email: 'john@example.com'
});
```

## With React Query

### Query (GET)
```tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@services/api';

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get<User[]>('/users'),
  });
}
```

### Mutation (POST/PUT/DELETE)
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newUser) => apiClient.post('/users', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

See full examples in the codebase.
