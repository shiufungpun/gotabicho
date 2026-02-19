# ShareIntent Logic Fix - Summary

## Problem

The ShareIntent system had issues with:

1. When a new share intent is received, old intent data was not properly cleared before navigation
2. When user switches to another app while on the add-bookmark page, share data persisted

## Solution

### 1. Hook Level Changes (`src/hooks/useShareIntent.ts`)

#### Added AppState Listener

- Imported `AppState` from `react-native`
- Added an `AppState` event listener that triggers when app goes to background or inactive
- Automatically clears share data when app state changes to background/inactive

```typescript
useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
            console.log('[ShareIntent] App going to background, clearing share data');
            if (shareData) {
                clearShareData();
            }
        }
    });

    return () => {
        subscription.remove();
    };
}, [shareData]);
```

### 2. ShareIntentHandler Changes (`src/components/share_instent/share_intent.tsx`)

#### Added New Share Detection

- Added `lastShareIdRef` to track the last processed share intent
- When a new share intent is detected (different from the last one), old data is cleared first
- Share data is now cleared **before** navigation instead of after
- This ensures clean state when navigating to add-bookmark or add-receipt screens

```typescript
const lastShareIdRef = useRef<string | null>(null);

// Check if this is a new share intent
const currentShareId = JSON.stringify({
    files: shareData.files?.map(f => f.path),
    text: shareData.text,
    webUrl: shareData.webUrl,
});

// If this is a new share intent (different from last one), clear old data first
if (lastShareIdRef.current && lastShareIdRef.current !== currentShareId) {
    console.log('[ShareIntentHandler] New share intent detected, clearing old data');
    clearShareData();
    setIsProcessing(false);
    processingRef.current = false;
}
```

#### Clear Before Navigation

All navigation calls now clear share data **before** navigating:

```typescript
// Clear share data before navigating
clearShareData();
setIsProcessing(false);
processingRef.current = false;

// Then navigate
router.push({...});
```

### 3. Add Bookmark Screen Changes (`app/add-bookmark.tsx`)

#### Added Share Data Cleanup

- Imported `useShareIntentHandler` hook
- Imported `AppState` from `react-native`
- Added AppState listener to clear share data when app goes to background
- Added cleanup in component unmount to ensure share data is cleared

```typescript
const {clearShareData} = useShareIntentHandler();

// Clear share data when app goes to background or component unmounts
useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
            console.log('[Bookmark] App going to background, clearing share data');
            clearShareData();
        }
    });

    // Clean up share data when component unmounts
    return () => {
        subscription.remove();
        console.log('[Bookmark] Component unmounting, clearing share data');
        clearShareData();
    };
}, [clearShareData]);
```

## Behavior Flow

### Scenario 1: New Share Intent Received While Processing

1. User shares content from another app
2. App opens and starts processing share intent
3. Before processing finishes, user shares new content
4. System detects new share intent ID
5. **Old share data is immediately cleared**
6. New share intent is processed
7. User is redirected to appropriate screen (add-bookmark or add-receipt)

### Scenario 2: User Switches Apps on Add-Bookmark Page

1. User shares Instagram/Threads URL
2. App opens add-bookmark screen
3. User switches to another app (e.g., Safari, Instagram)
4. AppState changes to 'background' or 'inactive'
5. **Share data is automatically cleared**
6. When user returns to app, no stale share data exists

### Scenario 3: User Closes Add-Bookmark Screen

1. User is on add-bookmark screen
2. User taps back button or dismisses modal
3. Component unmounts
4. **Share data is cleared in cleanup function**
5. No stale data remains in memory

## Benefits

✅ **No Stale Data**: Share data is always cleared when user leaves the screen or switches apps
✅ **Clean State**: Each new share intent starts with a clean slate
✅ **Memory Efficient**: Share data doesn't persist unnecessarily in memory
✅ **Better UX**: Users won't see old share content when they come back
✅ **Predictable Behavior**: Consistent behavior across different share scenarios

## Testing Checklist

- [ ] Share Instagram URL → Check add-bookmark opens with correct data
- [ ] While on add-bookmark, switch to Safari → Come back → Verify share data is cleared
- [ ] Share Instagram URL, then immediately share another → Verify old data is cleared
- [ ] Share image → Check add-receipt opens correctly
- [ ] While on add-receipt, switch apps → Come back → Verify share data is cleared
- [ ] Navigate back from add-bookmark → Verify share data is cleared

## Files Modified

1. `src/hooks/useShareIntent.ts` - Added AppState listener
2. `src/components/share_instent/share_intent.tsx` - Added new share detection and clear-before-navigate
3. `app/add-bookmark.tsx` - Added AppState listener and cleanup on unmount

