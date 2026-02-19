# Share Intent Cancel Button Fix

## Problem

When users clicked the "Cancel" button in screens opened via share intent (add-bookmark, add-receipt), the behavior
should close the app or return to the source app (e.g., Instagram, Safari) but it wasn't working correctly.

## Root Cause

The implementation needed to properly handle platform differences:

- **Android**: Can use `BackHandler.exitApp()` to close the app
- **iOS**: Cannot programmatically close apps due to App Store guidelines

## Solution

### For `add-bookmark.tsx`

Changed the `handleCancel` function to:

```typescript
const handleCancel = () => {
    console.log('[Bookmark] Cancel button pressed, clearing share data');
    clearShareData();

    // Close the app to return to the sharing app (Instagram/Safari)
    if (Platform.OS === 'android') {
        // On Android, exit the app to return to the sharing app
        BackHandler.exitApp();
    } else {
        // On iOS, we can't programmatically close the app due to App Store guidelines
        // Instead, navigate to home screen and the user can manually switch back
        // The share extension will automatically dismiss when they switch apps
        router.replace('/');
    }
};
```

**Key changes:**

- Added `BackHandler` and `Platform` imports
- Android: Uses `BackHandler.exitApp()` to close the app and return to sharing app
- iOS: Uses `router.replace('/')` to navigate to home (App Store doesn't allow programmatic app closure)

### For `add-receipt.tsx`

Changed the `handleCancel` function to:

```typescript
const handleCancel = () => {
    // If we came from a share intent, close the app to return to the sharing app
    if (sharedImagePath || sharedText || sharedUrl) {
        console.log('[AddReceipt] Cancel from share intent, closing app');
        // Clean up the shared image if it exists
        if (receiptImagePath) {
            deleteFile(receiptImagePath).catch(error =>
                console.error('Error cleaning up shared image:', error)
            );
        }

        // Close the app to return to the sharing app (Instagram/Safari)
        if (Platform.OS === 'android') {
            // On Android, exit the app to return to the sharing app
            BackHandler.exitApp();
        } else {
            // On iOS, we can't programmatically close the app due to App Store guidelines
            // Navigate to home screen and the user can manually switch back
            router.replace('/');
        }
    } else {
        // Regular back navigation if not from share intent
        router.back();
    }
};
```

**Key changes:**

- Added `BackHandler` and `Platform` imports
- Detects if opened from share intent (checks for `sharedImagePath`, `sharedText`, or `sharedUrl`)
- When from share intent:
    - Cleans up shared images to prevent file leaks
    - Android: Uses `BackHandler.exitApp()` to close the app
    - iOS: Uses `router.replace('/')` to navigate to home
- When not from share intent: uses `router.back()` for normal navigation

## Testing

To test the fix:

1. Open Instagram/Safari and share content to Gotabicho
2. App opens to add-bookmark or add-receipt screen
3. Click the Cancel button
4. **Expected behavior:**
    - **Android**: App closes and returns to Instagram/Safari immediately
    - **iOS**: App navigates to home screen (user can manually switch back to Instagram/Safari)
5. **Previous behavior**: App would navigate back in the stack inconsistently

## Technical Details

### Platform Differences

**Android:**

- `BackHandler.exitApp()` immediately closes the app
- User is returned to the sharing app (Instagram/Safari)
- Clean and immediate UX

**iOS:**

- Apple's App Store guidelines prohibit programmatic app termination
- Apps that call `exit()` or similar functions are rejected
- Solution: Navigate to home screen, allowing user to manually switch apps
- The share extension automatically cleans up when user switches away

### Why This Approach Works

1. **Respects Platform Guidelines**: Uses platform-appropriate methods
2. **Clean User Experience**:
    - Android users get immediate return to sharing app
    - iOS users get a predictable home screen state
3. **File Cleanup**: Properly deletes shared images to prevent storage leaks
4. **Share Intent Reset**: Clears share intent data before closing/navigating

### Share Intent Flow After Fix

**Android:**

```
Share from Instagram → Add Bookmark Screen
    ↓ (Cancel)
App Closes → Back to Instagram
```

**iOS:**

```
Share from Instagram → Add Bookmark Screen
    ↓ (Cancel)
Home Screen (/) → User manually switches to Instagram
```

## Related Files

- `/app/add-bookmark.tsx` - Bookmark creation from share intent
- `/app/add-receipt.tsx` - Receipt creation from share intent
- `/src/hooks/useShareIntent.ts` - Share intent handler hook
- `/ios/ShareExtension/ShareViewController.swift` - iOS native share extension

## Notes

- iOS limitation is by design from Apple to prevent malicious apps from force-closing
- The iOS behavior (going to home screen) is acceptable UX and follows platform conventions
- Both platforms properly clean up share intent data via `clearShareData()` or `resetShareIntent()`

