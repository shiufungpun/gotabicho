# Share Intent - Quick Start Guide

## ✅ Implementation Complete

The expo-share-intent integration is now fully implemented in your Gotabicho app!

## What Was Added

### 1. **New Files Created**

- ✅ `src/hooks/useShareIntent.ts` - Hook for handling shared content
- ✅ `src/helpers/fileHelpers.ts` - File management utilities
- ✅ `src/db/migrations.ts` - Database migration for image support
- ✅ `docs/SHARE_INTENT_GUIDE.md` - Complete documentation

### 2. **Modified Files**

- ✅ `app/_layout.tsx` - Added share intent detection and navigation
- ✅ `app/add-receipt.tsx` - Added image preview and shared content support
- ✅ `src/db/schema/receipts.ts` - Added `image_path` column
- ✅ `src/db/db.ts` - Updated database schema with `image_path`
- ✅ `src/types/index.ts` - Added `image_path` to Receipt interface
- ✅ `src/repositories/receiptRepository.ts` - Updated to save image paths
- ✅ `src/providers/DatabaseProvider.tsx` - Added migration execution

### 3. **Dependencies Installed**

- ✅ `expo-file-system` - For file operations

## How to Test

### Step 1: Rebuild the iOS App

Since the native Share Extension is already configured, rebuild the app:

```bash
cd /Users/billypun/Documents/Projects/gotabicho
npx expo run:ios
```

### Step 2: Test Share from Photos

1. Open the **Photos** app on your iOS device/simulator
2. Select any image (could be a receipt photo)
3. Tap the **Share** button (square with arrow)
4. Scroll and find **Gotabicho**
5. Tap it

**Expected Result**:

- Gotabicho app opens
- Navigates to Add Receipt screen
- Shows the shared image preview at the top
- Ready to add receipt details

### Step 3: Test Share from Safari

1. Open **Safari**
2. Visit any website (e.g., a restaurant website)
3. Tap the **Share** button
4. Select **Gotabicho**

**Expected Result**:

- App opens to Add Receipt screen
- Store name field is pre-filled with the URL or page title

### Step 4: Create a Receipt with Shared Image

1. After sharing an image from Photos
2. Fill in the receipt details:
    - Store name
    - Select who paid
    - Add items with amounts
3. Tap **Save Receipt**
4. Navigate to the receipt details to see the saved image

## Features Now Available

### 🎉 For Users

- **Share Receipt Photos**: Quickly add receipt images from your photo library
- **Share from Websites**: Pre-fill receipt info from restaurant/store websites
- **Visual Receipt Records**: See the actual receipt image with each entry
- **Easy Deletion**: Remove images if added by mistake

### 🔧 For Future Development

The foundation is ready for:

- OCR (Optical Character Recognition) to auto-extract receipt data
- Multiple images per receipt
- Image editing (crop, rotate, enhance)
- Smart trip detection when sharing

## Key Code Patterns

### Accessing Share Intent in Any Component

```typescript
import {useShareIntentHandler} from '../src/hooks/useShareIntent';

function MyComponent() {
    const {shareData, clearShareData} = useShareIntentHandler();

    useEffect(() => {
        if (shareData?.files.length > 0) {
            // Handle shared files
            console.log('Shared file:', shareData.files[0].path);
        }
    }, [shareData]);
}
```

### Displaying Receipt Images

```typescript
// In any receipt display component
{
    receipt.image_path && (
        <Image
            source = {
    {
        uri: receipt.image_path
    }
}
    style = {
    {
        width: '100%', height
    :
        300
    }
}
    resizeMode = "contain"
        / >
)
}
```

### Copying Shared Files

```typescript
import {copySharedFileToAppDirectory} from '../src/helpers/fileHelpers';

const newPath = await copySharedFileToAppDirectory(
    sharedFilePath,
    'receipt'  // prefix for filename
);
```

## Debugging Tips

### Enable Debug Logging

The share intent hook already has debug mode enabled. Check console for:

```
[ShareIntent] Received share intent: {...}
[StackNavigator] Processing share intent: {...}
[AddReceipt] Received shared image: file://...
```

### Common Issues & Solutions

**Issue**: Share extension doesn't appear

- **Fix**: Run `npx expo run:ios` (not `npx expo start`)
- The share extension needs to be rebuilt with the app

**Issue**: Image not showing

- **Fix**: Check that the file was copied to app directory
- Look for `[FileHelper] Copied file from...` in console

**Issue**: App doesn't open when sharing

- **Fix**: Verify URL scheme `gotabicho://` is configured
- Check `ios/Gotabicho/Info.plist` for URL schemes

**Issue**: Existing app doesn't have image_path column

- **Fix**: Migration runs automatically on next app launch
- The `DatabaseProvider` will add the column

## Database Migration

The migration runs automatically when the app starts. If you need to manually verify:

```typescript
// In DatabaseProvider, this runs automatically:
await migrateReceiptsImagePath();
```

This adds the `image_path` column to existing databases without data loss.

## Next Steps

### Recommended Enhancements

1. **Add OCR Support**:
   ```bash
   npm install react-native-text-recognition
   # or
   npm install tesseract.js
   ```

2. **Add Image Picker**:
   ```bash
   npx expo install expo-image-picker
   ```
   Allow users to add receipt photos directly from the add-receipt screen

3. **Add Receipt Gallery**:
   Create a gallery view to show all receipt images in a trip

4. **Add Image Compression**:
   ```bash
   npx expo install expo-image-manipulator
   ```
   Compress images before saving to reduce storage

### Example: Adding Image Picker

```typescript
// In add-receipt.tsx
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
    });

    if (!result.canceled) {
        const newPath = await copySharedFileToAppDirectory(
            result.assets[0].uri,
            'receipt'
        );
        setReceiptImagePath(newPath);
    }
};

// Add button in UI:
<TouchableOpacity onPress = {pickImage} >
<Ionicons name = "camera"
size = {24}
/>
< Text > Add
Photo < /Text>
< /TouchableOpacity>
```

## File Structure

```
gotabicho/
├── app/
│   ├── _layout.tsx              ← Share intent handler
│   └── add-receipt.tsx          ← Image preview & form
├── src/
│   ├── hooks/
│   │   └── useShareIntent.ts    ← Share intent hook
│   ├── helpers/
│   │   └── fileHelpers.ts       ← File operations
│   ├── db/
│   │   ├── db.ts                ← Schema with image_path
│   │   ├── migrations.ts        ← Auto migration
│   │   └── schema/
│   │       └── receipts.ts      ← Receipt schema
│   ├── repositories/
│   │   └── receiptRepository.ts ← Saves image_path
│   └── types/
│       └── index.ts             ← Receipt type
├── ios/
│   └── ShareExtension/          ← Native iOS extension
│       └── ShareViewController.swift
└── docs/
    ├── SHARE_INTENT_GUIDE.md    ← Full documentation
    └── SHARE_INTENT_QUICKSTART.md ← This file
```

## Testing Checklist

- [ ] Share image from Photos → Receipt created with image
- [ ] Share URL from Safari → Store name pre-filled
- [ ] Share text → Store name pre-filled
- [ ] Remove image from receipt → Image deleted
- [ ] Save receipt with image → Image path in database
- [ ] View receipt details → Image displays correctly
- [ ] App works without sharing → Normal flow unaffected

## Support

If you encounter any issues:

1. Check the console logs for errors
2. Verify the app was rebuilt with `npx expo run:ios`
3. Check that entitlements match (app group)
4. Review `docs/SHARE_INTENT_GUIDE.md` for detailed docs

---

**Status**: ✅ Ready to Test
**Date**: February 13, 2026
**Version**: 1.0.0
