# Migration from React Navigation to Expo Router

## Overview

Successfully migrated the Gotabicho app from React Navigation to Expo Router's file-based routing system.

## Changes Made

### 1. New File Structure

Created the `app/` directory with file-based routing:

```
app/
├── _layout.tsx              # Root layout with Stack navigator
├── index.tsx                # Trip list screen (home)
├── add-trip.tsx             # Add new trip modal
├── add-receipt.tsx          # Add receipt modal
├── receipt/
│   └── [id].tsx            # Receipt detail screen (dynamic route)
└── trip/
    └── [id]/               # Trip detail with tabs (dynamic route)
        ├── _layout.tsx     # Tab layout
        ├── index.tsx       # Expenses tab
        ├── participants.tsx # Participants tab
        └── settlement.tsx  # Settlement tab
```

### 2. Updated Navigation Patterns

**Before (React Navigation):**

```typescript
import {useNavigation} from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('TripHome', {tripId: trip.id, title: trip.name});
```

**After (Expo Router):**

```typescript
import {useRouter} from 'expo-router';

const router = useRouter();
router.push(`/trip/${trip.id}`);
```

### 3. Route Parameters

**Before:**

```typescript
const {tripId} = route.params;
```

**After:**

```typescript
import {useLocalSearchParams} from 'expo-router';

const {id} = useLocalSearchParams<{ id: string }>();
const tripId = parseInt(id || '0');
```

### 4. Updated Files

#### Components Updated to use Expo Router:

- `src/containers/TripCard.tsx`
- `src/containers/ActiveTripCard.tsx`
- `src/containers/AddTripCard.tsx`
- `src/containers/CarouselTripCard.tsx`
- `src/containers/CarouselTripCardV2.tsx`
- `src/components/homepage/TripList.tsx`

#### Screens Migrated to app/ directory:

- `TripListScreen` → `app/index.tsx`
- `AddTripScreen` → `app/add-trip.tsx`
- `TripExpensesScreen` → `app/trip/[id]/index.tsx`
- `ParticipantListScreen` → `app/trip/[id]/participants.tsx`
- `SettlementScreen` → `app/trip/[id]/settlement.tsx`
- `AddReceiptScreen` → `app/add-receipt.tsx`
- `ReceiptDetailScreen` → `app/receipt/[id].tsx`

### 5. Dependencies Removed

Removed React Navigation packages from package.json:

- `@react-navigation/bottom-tabs`
- `@react-navigation/native`
- `@react-navigation/native-stack`

### 6. App.tsx Changes

The App.tsx file is no longer used. Expo Router uses:

- Entry point: `expo-router/entry` (already configured in package.json)
- Root layout: `app/_layout.tsx`

## Next Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Remove old navigation folder (optional):**
   ```bash
   rm -rf src/navigation
   ```

3. **Remove old screen files (optional):**
   ```bash
   rm -rf src/screens
   ```

4. **Clear cache and restart:**
   ```bash
   npx expo start --clear
   ```

## Key Benefits

✅ **File-based routing** - Routes are automatically created from file structure
✅ **Type-safe navigation** - Better TypeScript support with Expo Router
✅ **Better code splitting** - Automatic code splitting per route
✅ **Deep linking** - Built-in support for universal links
✅ **Layouts** - Shared layouts with `_layout.tsx` files
✅ **Tabs** - Native tab navigation with Expo Router Tabs

## Navigation Examples

### Push to a screen:

```typescript
router.push('/add-trip');
router.push(`/trip/${tripId}`);
router.push(`/receipt/${receiptId}`);
```

### Navigate with query params:

```typescript
router.push(`/add-receipt?tripId=${tripId}`);
```

### Go back:

```typescript
router.back();
```

### Replace current route:

```typescript
router.replace('/');
```

## Troubleshooting

If you encounter issues:

1. Clear the cache: `npx expo start --clear`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check that all imports use `expo-router` instead of `@react-navigation/*`
4. Verify file paths in the app/ directory match your route structure
