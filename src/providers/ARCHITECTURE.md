# Provider Architecture

## Visual Structure

```
app/_layout.tsx
│
└─> RootLayout
    │
    └─> <AppProvider>                    ← Wraps entire app
        │
        ├─> <ThemeProvider>              ← Provides theme colors
        │   │
        │   └─> <DatabaseProvider>       ← Manages database init
        │       │
        │       └─> <AppContent>         ← Your app content
        │           │
        │           └─> <StackNavigator> ← Navigation screens
        │               │
        │               ├─> index
        │               ├─> add-trip
        │               ├─> trip/[id]
        │               ├─> add-receipt
        │               └─> receipt/[id]
```

## How Providers Flow

```
┌─────────────────────────────────────────────────────────────┐
│  AppProvider (Combines all providers)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ThemeProvider (Theme colors & scheme)                │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  DatabaseProvider (DB initialization)           │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │                                           │  │  │  │
│  │  │  │  Your App Components                      │  │  │  │
│  │  │  │  - Can use useThemeContext()              │  │  │  │
│  │  │  │  - Can use useDatabaseContext()           │  │  │  │
│  │  │  │                                           │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Example

```
User interacts with UI
        ↓
Component calls hook
        ↓
const { colors } = useThemeContext()
        ↓
Hook accesses Context
        ↓
Context returns value from Provider
        ↓
Component renders with value
```

## Component Usage Pattern

```tsx
// Any component in your app can access provider data

import {useThemeContext} from '../src/providers';

function MyScreen() {
    // ✅ This works because MyScreen is wrapped by AppProvider
    const {colors} = useThemeContext();

    return (
        <View style={{backgroundColor: colors.background}}>
            <Text style={{color: colors.text}}>Hello!</Text>
        </View>
    );
}
```

## Adding a New Provider

```
1. Create Provider File
   ↓
2. Export from index.ts
   ↓
3. Add to AppProvider.tsx (nest inside existing providers)
   ↓
4. Use the hook in any component
```

## Current Provider Hierarchy

```typescript
AppProvider
├── ThemeProvider         // Theme colors and color scheme
└── DatabaseProvider      // Database initialization state
```

## Example: Adding SettingsProvider

```typescript
AppProvider
├── ThemeProvider
└── DatabaseProvider
    └── SettingsProvider  // ← Add new provider here
```

Update `AppProvider.tsx`:

```tsx
export function AppProvider({children}: AppProviderProps) {
    return (
        <ThemeProvider>
            <DatabaseProvider>
                <SettingsProvider>  {/* ← Add here */}
                    {children}
                </SettingsProvider>
            </DatabaseProvider>
        </ThemeProvider>
    );
}
```

## Key Files

| File                                 | Purpose                        |
|--------------------------------------|--------------------------------|
| `src/providers/index.ts`             | Export all providers & hooks   |
| `src/providers/AppProvider.tsx`      | Combine all providers          |
| `src/providers/ThemeProvider.tsx`    | Theme context                  |
| `src/providers/DatabaseProvider.tsx` | Database context               |
| `app/_layout.tsx`                    | App entry point with providers |

## Benefits

✅ **No Prop Drilling**: Access data anywhere without passing props  
✅ **Centralized State**: Manage global state in one place  
✅ **Type Safety**: Full TypeScript support  
✅ **Easy Testing**: Mock providers for testing  
✅ **Separation of Concerns**: Each provider handles one thing

## Real-World Example

```tsx
// Before Providers (Prop Drilling 😢)
<App>
    <Home colors={colors}>
        <TripList colors={colors}>
            <TripCard colors={colors}>
                {/* Need to pass colors through every level! */}
            </TripCard>
        </TripList>
    </Home>
</App>

// With Providers (Clean 😊)
<AppProvider>
    <Home>
        <TripList>
            <TripCard>
                {/* Any component can use useThemeContext()! */}
            </TripCard>
        </TripList>
    </Home>
</AppProvider>
```
