# 🎯 DEEP LINK FIX - Quick Reference

## ⚡ The Problem

Sharing from Photos → App shows "No route found" error

## ✅ The Solution

Changed Share Extension URL from:

- **Before**: `gotabicho://dataUrl=gotabichoShareKey#media` ❌
- **After**: `gotabicho://` ✅

## 🔧 Files Changed

1. `ios/ShareExtension/ShareViewController.swift` - Simplified URL
2. `app/+not-found.tsx` - Created fallback route
3. `app/_layout.tsx` - Improved share detection
4. `app.json` - Configured plugin
5. `src/hooks/useShareIntent.ts` - Fixed TypeScript errors

## 🚀 To Test

```bash
# MUST rebuild native code
npx expo run:ios

# Then share from Photos
```

## 📋 Expected Behavior

1. Share image from Photos
2. Tap "Gotabicho"
3. App opens to home screen briefly
4. Automatically navigates to add-receipt screen
5. Image preview appears
6. ✅ SUCCESS!

## 🐛 If Still Not Working

1. Clean build: `cd ios && pod install && cd ..`
2. Rebuild: `npx expo run:ios`
3. Fully close and reopen the app
4. Try sharing again

## 📝 Key Insight

The deep link URL doesn't need to pass data - it only needs to open the app. The actual share data is read from
UserDefaults by the `expo-share-intent` hook.

---

**Status**: ✅ FIXED & READY TO TEST
