# Deep Link Issue Fix

## Problem

When sharing from other apps, the iOS Share Extension opens the app with a deep link:

```
gotabicho://dataUrl=gotabichoShareKey#media
```

Expo Router tries to navigate to `/dataUrl=gotabichoShareKey` which doesn't exist, resulting in a "No route found"
error.

## Solution

The fix involves several changes:

### 1. Add +not-found.tsx Route

Created `/app/+not-found.tsx` that automatically redirects unmatched routes back to the home screen.

### 2. Configure expo-share-intent in app.json

Updated app.json to properly configure the share intent plugin with activation rules.

### 3. Update Share Intent Handler

- Changed `resetOnBackground: false` to prevent premature clearing
- Added `hasShareIntent` check to ensure we only process valid shares
- Added 100ms delay before navigation to ensure router is ready

### 4. Updated App Layout

- Added +not-found screen configuration to Stack
- Improved share intent detection logic
- Better error handling

## How It Works Now

```
User shares from Photos
    ↓
Share Extension saves data & opens: gotabicho://dataUrl=...
    ↓
App opens → URL doesn't match route → Goes to +not-found
    ↓
+not-found redirects to "/" (home)
    ↓
useShareIntentHandler detects shareIntent data
    ↓
App Layout processes and navigates to /add-receipt
    ↓
✅ User sees add-receipt screen with shared content
```

## Testing

1. Rebuild the app:
   ```bash
   npx expo run:ios
   ```

2. Share from Photos:
    - The app will briefly show "Redirecting..."
    - Then immediately navigate to add-receipt with the image

3. Check console logs for:
   ```
   [NotFound] Redirecting to home...
   [ShareIntent] Received share intent: {...}
   [StackNavigator] Processing share intent: {...}
   ```

## Alternative Solution (if still having issues)

If the deep link routing is still problematic, we can modify the ShareViewController.swift to use a simpler URL scheme
that doesn't include parameters:

```swift
// Instead of: gotabicho://dataUrl=gotabichoShareKey#media
// Use: gotabicho://
```

This would open the app without any path, directly to the home screen.
