# Providers Guide

This guide explains how to use and create Context Providers in the Gotabicho project.

## What are Providers?

Providers use React's Context API to share state and functionality across your entire app without prop drilling. They
wrap your app and make data available to any component that needs it.

## Available Providers

### 1. ThemeProvider

Provides theme colors and color scheme throughout the app.

**Usage:**

```tsx
import { useThemeContext } from '../src/providers';

function MyComponent() {
  const { colors, colorScheme } = useThemeContext();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        Current theme: {colorScheme}
      </Text>
    </View>
  );
}
```

### 2. DatabaseProvider

Handles database initialization and provides ready state.

**Usage:**

```tsx
import { useDatabaseContext } from '../src/providers';

function MyComponent() {
  const { isReady, error } = useDatabaseContext();
  
  if (!isReady) {
    return <Text>Loading database...</Text>;
  }
  
  if (error) {
    return <Text>Database error: {error.message}</Text>;
  }
  
  return <Text>Database ready!</Text>;
}
```

### 3. ActiveTripProvider (Example)

Manages the currently active trip. This is an example of how to create a custom provider.

**Usage:**

```tsx
import { useActiveTripContext } from '../src/providers';

function MyComponent() {
  const { activeTripId, setActiveTripId } = useActiveTripContext();
  
  return (
    <View>
      <Text>Active Trip: {activeTripId}</Text>
      <Button 
        title="Select Trip" 
        onPress={() => setActiveTripId(123)} 
      />
    </View>
  );
}
```

## How Providers are Set Up

All providers are combined in `AppProvider` and wrapped around your app in `app/_layout.tsx`:

```tsx
export default function RootLayout() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
```

The `AppProvider` combines all providers in one place:

```tsx
// src/providers/AppProvider.tsx
export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        {/* Add more providers here */}
        {children}
      </DatabaseProvider>
    </ThemeProvider>
  );
}
```

## Creating a New Provider

Follow these steps to create your own provider:

### Step 1: Create the Provider File

Create a new file in `src/providers/` (e.g., `UserProvider.tsx`):

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define the context value type
interface UserContextValue {
  userId: string | null;
  userName: string | null;
  setUser: (id: string, name: string) => void;
  clearUser: () => void;
}

// 2. Create the context
const UserContext = createContext<UserContextValue | undefined>(undefined);

// 3. Define props for the provider
interface UserProviderProps {
  children: ReactNode;
}

// 4. Create the provider component
export function UserProvider({ children }: UserProviderProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const setUser = (id: string, name: string) => {
    setUserId(id);
    setUserName(name);
  };

  const clearUser = () => {
    setUserId(null);
    setUserName(null);
  };

  const value: UserContextValue = {
    userId,
    userName,
    setUser,
    clearUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// 5. Create the hook to use the context
export function useUserContext(): UserContextValue {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  
  return context;
}
```

### Step 2: Export from index.ts

Add your provider to `src/providers/index.ts`:

```tsx
export { UserProvider, useUserContext } from './UserProvider';
```

### Step 3: Add to AppProvider

Update `src/providers/AppProvider.tsx`:

```tsx
import { UserProvider } from './UserProvider';

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
```

### Step 4: Use in Components

Now you can use your provider anywhere in your app:

```tsx
import { useUserContext } from '../src/providers';

function ProfileScreen() {
  const { userId, userName, setUser, clearUser } = useUserContext();
  
  return (
    <View>
      {userId ? (
        <>
          <Text>Welcome, {userName}!</Text>
          <Button title="Logout" onPress={clearUser} />
        </>
      ) : (
        <Button 
          title="Login" 
          onPress={() => setUser('123', 'John Doe')} 
        />
      )}
    </View>
  );
}
```

## Advanced Patterns

### Provider with useEffect

Providers can run effects when they mount:

```tsx
export function DataSyncProvider({ children }: DataSyncProviderProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Sync data when app starts
    syncDataFromServer()
      .then(() => setIsSyncing(false))
      .catch(console.error);
  }, []);

  return (
    <DataSyncContext.Provider value={{ isSyncing }}>
      {children}
    </DataSyncContext.Provider>
  );
}
```

### Provider with useReducer

For complex state, use useReducer:

```tsx
type Action = 
  | { type: 'ADD_ITEM'; item: Item }
  | { type: 'REMOVE_ITEM'; id: number }
  | { type: 'CLEAR_ALL' };

function cartReducer(state: Item[], action: Action): Item[] {
  switch (action.type) {
    case 'ADD_ITEM':
      return [...state, action.item];
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.id);
    case 'CLEAR_ALL':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, dispatch] = useReducer(cartReducer, []);

  return (
    <CartContext.Provider value={{ items, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}
```

### Provider with Async Operations

```tsx
export function TripsProvider({ children }: TripsProviderProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await getAllTrips();
      setTrips(data);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  return (
    <TripsContext.Provider value={{ trips, loading, loadTrips }}>
      {children}
    </TripsContext.Provider>
  );
}
```

## Best Practices

1. **One Provider Per Concern**: Each provider should manage one specific piece of state or functionality.

2. **Error Boundaries**: Always check if context is undefined and throw an error if the hook is used outside the
   provider.

3. **Memoization**: Use `useMemo` for complex computed values to avoid unnecessary re-renders.

4. **Provider Order**: Order matters when providers depend on each other. Put independent providers (like Theme) at the
   top.

5. **Keep Providers Focused**: Don't put everything in one provider. Split concerns into separate providers.

6. **Export Hooks, Not Context**: Always export the `useContext` hook, not the context itself.

## Common Use Cases

- **ThemeProvider**: App-wide theming and styling
- **AuthProvider**: User authentication state
- **DatabaseProvider**: Database initialization and ready state
- **NavigationProvider**: Navigation state and helpers
- **SettingsProvider**: App settings and preferences
- **NotificationProvider**: Toast/notification system
- **LanguageProvider**: Internationalization (i18n)
- **ModalProvider**: Global modal management

## Troubleshooting

### "Context is undefined" Error

This means you're trying to use a context hook outside its provider. Make sure:

1. The provider is in `AppProvider.tsx`
2. You're calling the hook inside a component that's wrapped by the provider
3. The provider is properly imported and wrapped around your app

### Performance Issues

If your app is slow and you suspect providers:

1. Use `React.memo()` on components
2. Split large providers into smaller ones
3. Use `useMemo` and `useCallback` for values and functions
4. Consider using context selectors for large state objects

## File Structure

```
src/
  providers/
    index.ts                  # Export all providers
    AppProvider.tsx           # Combines all providers
    ThemeProvider.tsx         # Theme context
    DatabaseProvider.tsx      # Database context
    ActiveTripProvider.tsx    # Example custom provider
    [YourProvider].tsx        # Your custom providers
```

## Summary

Providers are a powerful pattern for sharing state across your React Native app. They:

- Eliminate prop drilling
- Centralize state management
- Make code more maintainable
- Enable separation of concerns

Start with the provided examples and create your own providers as your app grows!
