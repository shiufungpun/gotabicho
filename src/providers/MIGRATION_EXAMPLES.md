# Migration Examples

## How to Convert Existing Code to Use Providers

### Example 1: Theme Hook Migration

**Before (Old way):**

```tsx
import {useTheme} from '../theme/useTheme';

function MyComponent() {
    const {colors} = useTheme();

    return <View style={{backgroundColor: colors.background}}/>;
}
```

**After (New way with Provider):**

```tsx
import {useThemeContext} from '../src/providers';

function MyComponent() {
    const {colors} = useThemeContext();

    return <View style={{backgroundColor: colors.background}}/>;
}
```

✅ **Your themed components already use the new provider!**

---

### Example 2: Database Initialization

**Before (In _layout.tsx):**

```tsx
export default function RootLayout() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        initDatabase()
            .then(() => setReady(true))
            .catch(console.error);
    }, []);

    if (!ready) return <Text>Loading...</Text>;

    return <App/>;
}
```

**After (With DatabaseProvider):**

```tsx
export default function RootLayout() {
    return (
        <AppProvider>
            <AppContent/>
        </AppProvider>
    );
}

function AppContent() {
    const {isReady} = useDatabaseContext();

    if (!isReady) return <Text>Loading...</Text>;

    return <App/>;
}
```

✅ **This is already implemented in your `_layout.tsx`!**

---

### Example 3: Sharing State Across Screens

**Before (Prop drilling):**

```tsx
// app/index.tsx
function HomePage() {
    const [selectedTripId, setSelectedTripId] = useState(null);

    return (
        <View>
            <TripList
                selectedId={selectedTripId}
                onSelect={setSelectedTripId}
            />
            <TripDetails tripId={selectedTripId}/>
        </View>
    );
}

// TripList component
function TripList({selectedId, onSelect}) {
    // Need to pass props down...
}
```

**After (With Provider):**

```tsx
// app/index.tsx
function HomePage() {
    return (
        <View>
            <TripList/>
            <TripDetails/>
        </View>
    );
}

// TripList component
function TripList() {
    const {activeTripId, setActiveTripId} = useActiveTripContext();

    return (
        <FlatList
            data={trips}
            renderItem={({item}) => (
                <TripCard
                    trip={item}
                    selected={item.id === activeTripId}
                    onPress={() => setActiveTripId(item.id)}
                />
            )}
        />
    );
}

// TripDetails component
function TripDetails() {
    const {activeTripId} = useActiveTripContext();

    if (!activeTripId) return <Text>Select a trip</Text>;

    return <TripInfo tripId={activeTripId}/>;
}
```

---

### Example 4: Settings Management

**Before (AsyncStorage in every component):**

```tsx
function CurrencySelector() {
    const [currency, setCurrency] = useState('USD');

    useEffect(() => {
        AsyncStorage.getItem('currency').then(setCurrency);
    }, []);

    const updateCurrency = async (newCurrency) => {
        setCurrency(newCurrency);
        await AsyncStorage.setItem('currency', newCurrency);
    };

    return <CurrencyPicker value={currency} onChange={updateCurrency}/>;
}
```

**After (With SettingsProvider):**

First, create `SettingsProvider.tsx`:

```tsx
export function SettingsProvider({children}) {
    const [currency, setCurrency] = useState('USD');

    useEffect(() => {
        AsyncStorage.getItem('currency').then(value => {
            if (value) setCurrency(value);
        });
    }, []);

    const updateCurrency = async (newCurrency) => {
        setCurrency(newCurrency);
        await AsyncStorage.setItem('currency', newCurrency);
    };

    return (
        <SettingsContext.Provider value={{currency, updateCurrency}}>
            {children}
        </SettingsContext.Provider>
    );
}
```

Then use it anywhere:

```tsx
function CurrencySelector() {
    const {currency, updateCurrency} = useSettingsContext();

    return <CurrencyPicker value={currency} onChange={updateCurrency}/>;
}

function PriceDisplay({amount}) {
    const {currency} = useSettingsContext();

    return <Text>{amount} {currency}</Text>;
}
```

---

### Example 5: Trip Management

**Your current code probably looks like:**

```tsx
// app/trip/[id]/index.tsx
function TripScreen() {
    const {id} = useLocalSearchParams();
    const [trip, setTrip] = useState(null);

    useEffect(() => {
        getTripById(id).then(setTrip);
    }, [id]);

    return <TripDetails trip={trip}/>;
}
```

**Could be enhanced with a TripsProvider:**

```tsx
// Create TripsProvider.tsx
export function TripsProvider({children}) {
    const [trips, setTrips] = useState([]);
    const [activeTrip, setActiveTrip] = useState(null);

    const loadTrips = async () => {
        const data = await getAllTrips();
        setTrips(data);
    };

    const selectTrip = async (tripId) => {
        const trip = await getTripById(tripId);
        setActiveTrip(trip);
    };

    useEffect(() => {
        loadTrips();
    }, []);

    return (
        <TripsContext.Provider value={{
            trips,
            activeTrip,
            selectTrip,
            loadTrips
        }}>
            {children}
        </TripsContext.Provider>
    );
}

// Then in your screen:
function TripScreen() {
    const {id} = useLocalSearchParams();
    const {activeTrip, selectTrip} = useTripsContext();

    useEffect(() => {
        selectTrip(id);
    }, [id]);

    return <TripDetails trip={activeTrip}/>;
}

// Bonus: Now other components can access trips too!
function TripList() {
    const {trips} = useTripsContext();

    return <FlatList data={trips}/>;
}
```

---

## When to Use Providers vs Local State

### ✅ Use Providers When:

- Data needs to be accessed by multiple unrelated components
- State needs to persist across navigation
- You want to avoid prop drilling
- Managing global app settings
- Handling authentication state
- Theme/styling that affects the whole app

### ❌ Use Local State When:

- Data is only used in one component
- Simple form inputs
- Temporary UI state (modals, dropdowns)
- Component-specific logic
- Performance-critical components

---

## Migration Checklist

For each global state in your app:

1. ☐ Identify where the state is used
2. ☐ Create a provider if multiple components need it
3. ☐ Move state initialization to the provider
4. ☐ Export a custom hook (e.g., `useMyContext`)
5. ☐ Add provider to `AppProvider.tsx`
6. ☐ Replace local state with context hook in components
7. ☐ Test that everything still works

---

## Common Patterns to Migrate

### Pattern 1: Shared Data

- **Old**: Fetch data in multiple places
- **New**: TripsProvider, ReceiptsProvider

### Pattern 2: User Preferences

- **Old**: AsyncStorage in every component
- **New**: SettingsProvider, PreferencesProvider

### Pattern 3: Global UI State

- **Old**: Props everywhere
- **New**: ModalProvider, NotificationProvider

### Pattern 4: Authentication

- **Old**: Check auth in every screen
- **New**: AuthProvider

---

## Your Current Setup (No Migration Needed!)

✅ Theme colors → Already using `ThemeProvider`  
✅ Database init → Already using `DatabaseProvider`  
✅ Themed components → Already updated

**Everything is already working with providers!** 🎉

Only create new providers when you identify new global state needs.
