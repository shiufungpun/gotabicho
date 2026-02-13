# Share Intent Flow - Visual Guide

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         OTHER APPS                                   │
│  📱 Photos   🌐 Safari   📝 Notes   📧 Mail   💬 Messages          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ User taps Share
                               │ Selects "Gotabicho"
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    iOS SHARE EXTENSION                               │
│  📄 ShareViewController.swift (Native Code)                         │
│                                                                      │
│  • Receives shared content (images, text, URLs, files)              │
│  • Processes and validates data                                     │
│  • Saves to UserDefaults in app group                               │
│    → group.com.mizutamine.gotabicho                                 │
│  • Launches main app via URL scheme                                 │
│    → gotabicho://                                                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ Deep link opens app
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      GOTABICHO APP OPENS                             │
│  🚀 App Launch / Return from Background                             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│               useShareIntentHandler Hook                             │
│  📍 src/hooks/useShareIntent.ts                                     │
│                                                                      │
│  • Wraps expo-share-intent's useShareIntent()                       │
│  • Reads from app group storage                                     │
│  • Structures data into ShareIntentData                             │
│                                                                      │
│  Returns:                                                            │
│  {                                                                   │
│    shareData: {                                                      │
│      files: [{ path, mimeType, fileName, width, height }],         │
│      text: "shared text",                                           │
│      webUrl: "https://example.com"                                  │
│    },                                                                │
│    clearShareData: () => void                                       │
│  }                                                                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ shareData detected
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  App Layout (_layout.tsx)                            │
│  📍 app/_layout.tsx                                                 │
│                                                                      │
│  useEffect(() => {                                                   │
│    if (shareData) {                                                  │
│      1. Get active trip from database                               │
│         const activeTrip = await getActiveTrip()                    │
│                                                                      │
│      2. If no active trip → Show alert & exit                       │
│                                                                      │
│      3. Copy shared files to permanent storage                      │
│         const newPath = await copySharedFileToAppDirectory(...)     │
│                                                                      │
│      4. Navigate to add-receipt with params:                        │
│         router.push({                                                │
│           pathname: '/add-receipt',                                 │
│           params: {                                                  │
│             tripId: activeTrip.id,                                  │
│             sharedImagePath: newPath,                               │
│             sharedText: shareData.text,                             │
│             sharedUrl: shareData.webUrl                             │
│           }                                                          │
│         })                                                           │
│                                                                      │
│      5. Clear share data                                            │
│         clearShareData()                                            │
│    }                                                                 │
│  }, [shareData])                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ Navigation
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│               Add Receipt Screen (add-receipt.tsx)                   │
│  📍 app/add-receipt.tsx                                             │
│                                                                      │
│  Receives params:                                                    │
│  • tripId: "123"                                                     │
│  • sharedImagePath: "file://.../receipt_xxx.jpg"                    │
│  • sharedText: "Restaurant Name"                                    │
│  • sharedUrl: "https://restaurant.com"                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────┐           │
│  │  [Receipt Image Preview]                             │           │
│  │  ┌──────────────────────────────────────────────┐   │           │
│  │  │                                               │   │           │
│  │  │         📷 Shared Receipt Image               │   │           │
│  │  │                                               │   │           │
│  │  │      (Shows sharedImagePath)                  │   │           │
│  │  │                                               │   │           │
│  │  └──────────────────────────────────────────────┘   │           │
│  │  [🗑️ Remove Image]                                   │           │
│  └─────────────────────────────────────────────────────┘           │
│                                                                      │
│  Store / Title: [Restaurant Name] ← Pre-filled from text/URL       │
│                                                                      │
│  Paid By: [You] [Friend 1] [Friend 2]                              │
│                                                                      │
│  Items:                                                              │
│  ┌─────────────────────────────────────────────────────┐           │
│  │ Item Name: [____]  Amount: [____]                    │           │
│  │ Category: [Food] [Play] [Transport] [Hotel]         │           │
│  │ Split with: [✓ You] [✓ Friend 1] [ Friend 2]        │           │
│  └─────────────────────────────────────────────────────┘           │
│                                                                      │
│  [+ Add Item]                                                        │
│                                                                      │
│  [Save Receipt] ← Saves with image_path                             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ User fills form & saves
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                 Receipt Repository                                   │
│  📍 src/repositories/receiptRepository.ts                           │
│                                                                      │
│  createReceipt({                                                     │
│    trip_id: 123,                                                     │
│    store_name: "Restaurant Name",                                   │
│    total_amount: 45.00,                                             │
│    image_path: "file://.../receipt_xxx.jpg",  ← Saved!             │
│    paid_by_participant_id: 1,                                       │
│    date: "2026-02-13",                                              │
│    ...                                                               │
│  })                                                                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE                                      │
│  📍 gotabicho.db (SQLite)                                           │
│                                                                      │
│  receipts table:                                                     │
│  ┌─────┬─────────┬──────────┬─────────────┬──────────────────┐    │
│  │ id  │ trip_id │ store    │ amount      │ image_path        │    │
│  ├─────┼─────────┼──────────┼─────────────┼──────────────────┤    │
│  │ 1   │ 123     │ Resta... │ 45.00       │ file://...jpg ✓   │    │
│  └─────┴─────────┴──────────┴─────────────┴──────────────────┘    │
│                                                                      │
│  receipt_items table:                                                │
│  ┌─────┬────────────┬──────────┬────────┬──────────┐              │
│  │ id  │ receipt_id │ name     │ amount │ category  │              │
│  ├─────┼────────────┼──────────┼────────┼──────────┤              │
│  │ 1   │ 1          │ Sushi    │ 25.00  │ Food      │              │
│  │ 2   │ 1          │ Drinks   │ 20.00  │ Food      │              │
│  └─────┴────────────┴──────────┴────────┴──────────┘              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ✅ Complete!
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     USER VIEWS RECEIPT                               │
│                                                                      │
│  • Receipt list shows store name & amount                           │
│  • Tap to view details                                              │
│  • Shows receipt image from image_path                              │
│  • Shows all items and shares                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Storage Flow

```
┌─────────────────────────────────────────────────────────┐
│  TEMPORARY STORAGE (App Group)                          │
│  group.com.mizutamine.gotabicho                         │
│                                                          │
│  file://.../Library/AppGroups/.../image_abc123.jpg     │
│  ↓ (Temporary - will be cleared)                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ copySharedFileToAppDirectory()
                       │ src/helpers/fileHelpers.ts
                       ↓
┌─────────────────────────────────────────────────────────┐
│  PERMANENT STORAGE (App Documents)                      │
│  FileSystem.documentDirectory                           │
│                                                          │
│  file://.../Documents/receipt_1707839234567_a1b2c3d.jpg│
│  ↓ (Permanent - stored with app)                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Saved to database
                       ↓
┌─────────────────────────────────────────────────────────┐
│  DATABASE (receipts.image_path)                         │
│                                                          │
│  "file://.../Documents/receipt_1707839234567_a1b2c3d.jpg"
└─────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App
└── AppProvider
    └── ThemeProvider
        └── DatabaseProvider (runs migrations)
            └── StackNavigator (handles share intent)
                ├── Index (homepage)
                ├── Add Trip
                ├── Trip Details
                └── Add Receipt ← Receives shared content
                    ├── Image Preview (if image shared)
                    ├── Store Name (pre-filled if text/URL)
                    ├── Payer Selection
                    ├── Items List
                    └── Save Button
```

---

## Hook Usage Pattern

```typescript
// Any component can use this pattern

import { useShareIntentHandler } from '../src/hooks/useShareIntent';
import { copySharedFileToAppDirectory } from '../src/helpers/fileHelpers';

function MyComponent() {
  const { shareData, clearShareData } = useShareIntentHandler();
  
  useEffect(() => {
    if (shareData) {
      handleShare(shareData);
      clearShareData();
    }
  }, [shareData]);
  
  const handleShare = async (data) => {
    // 1. Check if files shared
    if (data.files.length > 0) {
      const file = data.files[0];
      const newPath = await copySharedFileToAppDirectory(file.path);
      console.log('Saved to:', newPath);
    }
    
    // 2. Check if text shared
    if (data.text) {
      console.log('Text:', data.text);
    }
    
    // 3. Check if URL shared
    if (data.webUrl) {
      console.log('URL:', data.webUrl);
    }
  };
}
```

---

## Database Migration Flow

```
App Starts
    ↓
DatabaseProvider initializes
    ↓
initDatabase() runs
    ↓ (Creates tables if not exist)
migrateReceiptsImagePath() runs
    ↓
Check if image_path column exists
    ↓
    ├─→ Yes: Skip migration
    │
    └─→ No: ALTER TABLE receipts ADD COLUMN image_path TEXT
            ↓
            ✅ Migration complete
```

---

## Error Handling Flow

```
Share Intent Received
    ↓
Try to get active trip
    ↓
    ├─→ No active trip
    │       ↓
    │   Show alert: "Please create a trip first"
    │       ↓
    │   clearShareData()
    │       ↓
    │   Exit
    │
    └─→ Active trip found
            ↓
        Try to copy file
            ↓
            ├─→ Copy failed
            │       ↓
            │   Log error
            │   Show alert
            │   clearShareData()
            │   Exit
            │
            └─→ Copy successful
                    ↓
                Navigate to add-receipt
                    ↓
                clearShareData()
                    ↓
                ✅ Success
```

---

## Testing Flow

```
1. Build App
   npx expo run:ios
       ↓
2. Create Trip
   Start date: Today
   End date: Tomorrow
       ↓
3. Open Photos
   Select image
       ↓
4. Tap Share
   Select "Gotabicho"
       ↓
5. Share Extension Runs
   Processes image
       ↓
6. App Opens
   useShareIntentHandler detects data
       ↓
7. File Copied
   To app documents directory
       ↓
8. Navigate to Add Receipt
   Image preview shown
   Store name empty (can be filled)
       ↓
9. User Fills Form
   Items, amounts, shares
       ↓
10. Save Receipt
    Image path saved to database
        ↓
    ✅ Test Passed!
```

---

## Key Integration Points

### 1. Native to React Native

```
iOS Share Extension (Swift)
    ↓ UserDefaults in app group
useShareIntent hook (JavaScript)
    ↓ Returns structured data
Your app components (React)
```

### 2. Temporary to Permanent Storage

```
App Group Storage (temporary)
    ↓ copySharedFileToAppDirectory()
App Documents Directory (permanent)
    ↓ Save path to database
Image persisted with app
```

### 3. Share to Receipt

```
Share from any app
    ↓ Share Extension
useShareIntentHandler
    ↓ App Layout
Active Trip Detection
    ↓ File Copy
Add Receipt Screen
    ↓ User Input
Receipt Repository
    ↓ Database
Receipt with Image ✅
```

---

This visual guide shows every step of the share intent integration!
