# Expo Share Intent Integration Guide

## Overview

This app now supports receiving shared content from other apps using `expo-share-intent`. Users can:

- Share receipt images from Photos, Camera, or other apps
- Share text or URLs to pre-fill receipt information
- Create receipts directly from shared content

## Architecture

### 1. Share Intent Flow

```
Other App (Photos, Safari, etc.)
    ↓ (User taps Share → Gotabicho)
iOS Share Extension (ShareViewController.swift)
    ↓ (Saves data to App Group: group.com.mizutamine.gotabicho)
App Launch with Share Intent
    ↓
useShareIntentHandler hook (src/hooks/useShareIntent.ts)
    ↓ (Detects shared data)
App Layout (_layout.tsx)
    ↓ (Processes and copies files)
Add Receipt Screen (add-receipt.tsx)
    ↓ (Pre-filled with shared content)
User adds receipt details → Save to Database
```

### 2. Key Components

#### **useShareIntentHandler Hook**

- Location: `src/hooks/useShareIntent.ts`
- Wraps `expo-share-intent`'s `useShareIntent` hook
- Returns: `{ shareData, hasShareIntent, clearShareData, error }`
- Processes shared files, text, and URLs

#### **File Helpers**

- Location: `src/helpers/fileHelpers.ts`
- `copySharedFileToAppDirectory()` - Copies shared files to app's permanent storage
- `deleteFile()` - Removes files
- `fileExists()` - Checks file existence

#### **App Layout Handler**

- Location: `app/_layout.tsx`
- Listens for incoming share intents
- Copies shared images to app directory
- Navigates to `/add-receipt` with shared data as params

#### **Add Receipt Screen**

- Location: `app/add-receipt.tsx`
- Accepts params: `sharedImagePath`, `sharedText`, `sharedUrl`
- Displays receipt image preview
- Pre-fills store name from shared text/URL
- Saves image path to database with receipt

### 3. Database Schema

The `receipts` table now includes:

```sql
CREATE TABLE receipts (
  ...
  image_path TEXT,  -- Path to receipt image
  ...
);
```

**Migration**: Automatic migration runs on app start via `DatabaseProvider` to add `image_path` column to existing
databases.

## Usage

### For Users

1. **Share from Photos**:
    - Open Photos app
    - Select a receipt image
    - Tap Share button
    - Select "Gotabicho"
    - App opens with image ready to create receipt

2. **Share from Safari**:
    - Browse a restaurant/store website
    - Tap Share button
    - Select "Gotabicho"
    - URL/page title pre-fills the receipt form

3. **Share from Other Apps**:
    - Any app supporting iOS Share Sheet
    - Share images, text, or URLs
    - Gotabicho processes and opens receipt form

### For Developers

#### Adding Share Intent Support to a New Screen

```typescript
import {useShareIntentHandler} from '../src/hooks/useShareIntent';

function MyScreen() {
    const {shareData, clearShareData} = useShareIntentHandler();

    useEffect(() => {
        if (shareData) {
            // Process shared data
            console.log('Received share:', shareData);

            // Copy file if needed
            if (shareData.files.length > 0) {
                copySharedFileToAppDirectory(shareData.files[0].path)
                    .then(newPath => {
                        // Use newPath
                    });
            }

            // Clear after processing
            clearShareData();
        }
    }, [shareData]);
}
```

#### Accessing Shared Images in Components

```typescript
// In add-receipt.tsx or any receipt display screen
{
    receiptImagePath && (
        <Image
            source = {
    {
        uri: receiptImagePath
    }
}
    style = {
    {
        width: '100%', height
    :
        200
    }
}
    />
)
}
```

## Configuration Files

### iOS Configuration

**App Group**: `group.com.mizutamine.gotabicho`

- Configured in: `ios/ShareExtension/ShareExtension.entitlements`
- Also in: `ios/Gotabicho/Gotabicho.entitlements`
- Both must match for data sharing

**URL Scheme**: `gotabicho://`

- Used to redirect from Share Extension back to main app

### Native Code

**ShareViewController.swift** (`ios/ShareExtension/ShareViewController.swift`)

- Handles native iOS share extension
- Processes images, videos, text, URLs, files
- Saves to shared UserDefaults in app group
- Redirects to main app via URL scheme

## Dependencies

- `expo-share-intent@^5.1.1` - Core share intent functionality
- `expo-file-system` - File operations
- `expo-router` - Navigation with params

## Debugging

Enable debug mode in `useShareIntentHandler`:

```typescript
const {shareIntent} = useShareIntent({
    debug: true,  // Logs all share intent events
    resetOnBackground: true,
});
```

### Common Issues

1. **Share extension not appearing**:
    - Rebuild iOS app: `npx expo run:ios`
    - Check entitlements match

2. **Images not loading**:
    - Check file permissions
    - Verify file was copied to app directory
    - Check console logs for errors

3. **Data not passing to app**:
    - Verify app group identifier matches
    - Check ShareViewController logs
    - Ensure URL scheme is correct

## Testing

### Test Share Intent

1. **From Simulator/Device Photos**:
   ```bash
   # Run the app
   npx expo run:ios
   
   # Open Photos app
   # Select an image
   # Tap Share → Gotabicho
   ```

2. **From Safari**:
    - Open any webpage
    - Tap Share button
    - Select Gotabicho
    - Verify URL/title is captured

## Future Enhancements

### Potential Features

1. **OCR Integration**:
    - Use Google Vision API or Tesseract
    - Auto-extract store name, date, amount from receipt images
    - Pre-fill form fields

2. **Multiple Images**:
    - Support multiple receipt images per receipt
    - Gallery view in receipt details

3. **Image Editing**:
    - Crop, rotate receipt images
    - Enhance contrast for better visibility

4. **Smart Trip Selection**:
    - Auto-detect active trip
    - Show trip picker if no active trip
    - Remember last used trip

5. **Share from App**:
    - Share receipts with friends
    - Export as PDF or image
    - Share trip summary

## API Reference

### useShareIntentHandler()

Returns an object with:

```typescript
{
    shareData: ShareIntentData | null;  // Shared content
    hasShareIntent: boolean;             // True if share is pending
    clearShareData: () => void;          // Clear processed share
    error: Error | null;                 // Any errors
}
```

### ShareIntentData

```typescript
interface ShareIntentData {
    files: ShareIntentFile[];  // Shared images/files
    text?: string;             // Shared text
    webUrl?: string;           // Shared URL
}

interface ShareIntentFile {
    path: string;      // File URI
    mimeType: string;  // e.g., 'image/jpeg'
    fileName: string;  // Original filename
    width?: number;    // Image dimensions
    height?: number;
}
```

## Security Considerations

- Shared files are copied to app's private document directory
- Original files in app group are temporary
- Files are stored locally, not uploaded automatically
- Users can delete images via UI

## Support

For issues related to:

- expo-share-intent: https://github.com/achorein/expo-share-intent
- File system: https://docs.expo.dev/versions/latest/sdk/filesystem/
- iOS Share Extensions: https://developer.apple.com/documentation/uikit/share_extensions

---

**Last Updated**: February 2026
**Version**: 1.0.0
