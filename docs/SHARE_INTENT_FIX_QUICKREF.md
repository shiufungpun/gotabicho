# ShareIntent Logic Fix - Quick Reference

## What Was Fixed

### ✅ New Share Intent Handling

- Old share data is **automatically cleared** when a new share intent is received
- Prevents mixing data from multiple shares
- Each share starts with a clean slate

### ✅ Background App Switch Handling

- Share data is **automatically cleared** when user switches to another app
- Works on both add-bookmark and add-receipt screens
- Prevents stale data from persisting

### ✅ Navigation Timing

- Share data is now cleared **before** navigation instead of after
- Cleaner state management
- No race conditions

## Key Changes

### Hook (`useShareIntent.ts`)

```typescript
// Auto-clears share data when app goes to background
AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
        clearShareData();
    }
});
```

### ShareIntentHandler (`share_intent.tsx`)

```typescript
// Detects new share intent and clears old data
if (lastShareIdRef.current !== currentShareId) {
    clearShareData(); // Clear old data first
}

// Clear before navigation
clearShareData();
router.push({...}); // Then navigate
```

### Add-Bookmark Screen (`add-bookmark.tsx`)

```typescript
// Cleanup on background and unmount
useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'background') clearShareData();
    });

    return () => {
        subscription.remove();
        clearShareData(); // Clean on unmount
    };
}, []);
```

## Testing

```bash
# Rebuild the app
npx expo run:ios
```

### Test Scenarios

1. **Basic Share**
    - Share Instagram URL → Should open add-bookmark with correct data

2. **Background Switch**
    - Share URL → Open add-bookmark → Switch to Safari → Return
    - Expected: Share data cleared, no stale content

3. **Multiple Shares**
    - Share URL A → Immediately share URL B
    - Expected: URL A data cleared, URL B shown

4. **Screen Dismiss**
    - Share URL → Open add-bookmark → Go back
    - Expected: Share data cleared on dismiss

## Console Logs to Watch

```
[ShareIntent] App going to background, clearing share data
[ShareIntentHandler] New share intent detected, clearing old data
[Bookmark] App going to background, clearing share data
[Bookmark] Component unmounting, clearing share data
```

## Files Modified

- `src/hooks/useShareIntent.ts`
- `src/components/share_instent/share_intent.tsx`
- `app/add-bookmark.tsx`
- `docs/SHARE_INTENT_FIX_SUMMARY.md` (new)
- `docs/SHARE_INTENT_FIX_QUICKREF.md` (this file)

