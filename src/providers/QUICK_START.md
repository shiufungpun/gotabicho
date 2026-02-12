# Provider Quick Start Guide

## TL;DR - How to Use Providers

### Using Existing Providers

```tsx
// Import the hook from providers
import {useThemeContext, useDatabaseContext} from '../src/providers';

function MyComponent() {
    // Use the hook in your component
    const {colors, colorScheme} = useThemeContext();
    const {isReady} = useDatabaseContext();

    return (
        <View style={{backgroundColor: colors.background}}>
            <Text style={{color: colors.text}}>
                {isReady ? 'Ready!' : 'Loading...'}
            </Text>
        </View>
    );
}
```

### Creating a New Provider (5 Steps)

1. **Create provider file** in `src/providers/MyProvider.tsx`
2. **Export** from `src/providers/index.ts`
3. **Add to** `src/providers/AppProvider.tsx`
4. **Use the hook** anywhere in your app

## Example: Create a SettingsProvider

### 1. Create `src/providers/SettingsProvider.tsx`

```tsx
import React, {createContext, useContext, useState, ReactNode} from 'react';

interface SettingsContextValue {
    currency: string;
    setCurrency: (currency: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({children}: { children: ReactNode }) {
    const [currency, setCurrency] = useState('USD');

    return (
        <SettingsContext.Provider value={{currency, setCurrency}}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettingsContext() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettingsContext must be used within SettingsProvider');
    return context;
}
```

### 2. Export in `src/providers/index.ts`

```tsx
export {SettingsProvider, useSettingsContext} from './SettingsProvider';
```

### 3. Add to `src/providers/AppProvider.tsx`

```tsx
import {SettingsProvider} from './SettingsProvider';

export function AppProvider({children}: AppProviderProps) {
    return (
        <ThemeProvider>
            <DatabaseProvider>
                <SettingsProvider>
                    {children}
                </SettingsProvider>
            </DatabaseProvider>
        </ThemeProvider>
    );
}
```

### 4. Use anywhere

```tsx
import {useSettingsContext} from '../src/providers';

function CurrencySelector() {
    const {currency, setCurrency} = useSettingsContext();
    return (
        <View>
            <Text>Currency: {currency}</Text>
            <Button title="USD" onPress={() => setCurrency('USD')}/>
            <Button title="EUR" onPress={() => setCurrency('EUR')}/>
        </View>
    );
}
```

## Available Providers in Your App

| Provider            | Hook                     | Purpose                          |
|---------------------|--------------------------|----------------------------------|
| ThemeProvider       | `useThemeContext()`      | Theme colors & color scheme      |
| DatabaseProvider    | `useDatabaseContext()`   | Database ready state             |
| ActiveTripProvider* | `useActiveTripContext()` | Active trip management (example) |

*Example provider - add to AppProvider.tsx to use

## Common Patterns

### State Management

```tsx
const [state, setState] = useState(initialValue);
```

### Async Operations

```tsx
useEffect(() => {
    fetchData().then(setData);
}, []);
```

### Computed Values

```tsx
const value = useMemo(() => computeValue(state), [state]);
```

### Callbacks

```tsx
const callback = useCallback(() => doSomething(), [dependency]);
```

## That's It!

Your providers are already set up and working in `app/_layout.tsx`. Just use the hooks in your components!

For more details, see the full [README.md](./README.md).
