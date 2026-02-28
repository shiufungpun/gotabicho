# Bookmark Details Page Implementation Summary

## Overview

Implemented a comprehensive bookmark details page with persistent queued background AI extraction. The system allows
users to save bookmarks from share intents (Instagram, Threads, Safari), automatically extracts attractions using AI,
and displays them in an organized view.

## Key Features

### 1. **Persistent Extraction Queue** (`AIExtractionProvider`)

- Queue survives app restarts using AsyncStorage
- Processes extractions sequentially (FIFO)
- Independent of navigation - continues even when user exits
- Status tracking: queued → processing → completed/failed
- Cancel extraction support

### 2. **Bookmark Repository** (`bookmarkRepository.ts`)

- Full CRUD operations for bookmarks
- Attraction management with tags
- Trip-bookmark linking (many-to-many)
- Retrieval with joined attractions and tags

### 3. **Bookmark Detail Page** (`/bookmark/[id]`)

- Displays bookmark metadata (thumbnail, title, description, source)
- Shows real-time extraction status with cancel option
- Groups attractions by type (sight, restaurant, shopping, play, hotel)
- Visit tracking with checkboxes
- Auto-refreshes when extraction completes

### 4. **Platform-Specific Flow**

**iOS:**

- After save → navigate to bookmark detail page
- User sees extraction progress in real-time

**Android:**

- After save → exit app to return to share source (Instagram/Safari)
- Extraction continues in background queue

### 5. **Trip Bookmarks View** (`/trip/[id]/bookmarks`)

- Lists all bookmarks linked to a trip
- Shows attraction count per bookmark
- Quick navigation to bookmark details

## Files Created/Modified

### Created Files

1. **`src/providers/AIExtractionProvider.tsx`** (239 lines)
    - Global extraction queue with AsyncStorage persistence
    - Sequential processing with Apple Intelligence AI
    - Status tracking per bookmark

2. **`src/repositories/bookmarkRepository.ts`** (195 lines)
    - `createBookmark()` - Create and return ID
    - `getBookmarkById()` - Fetch with attractions/tags
    - `getBookmarksByTripId()` - Fetch for trip
    - `saveAttractions()` - Store AI-extracted items
    - `linkBookmarkToTrips()` - Many-to-many linking
    - `updateAttractionVisited()` - Toggle visited status

3. **`app/bookmark/index.tsx`** (390 lines)
    - Bookmark detail page with extraction status
    - Grouped attractions by type with icons/colors
    - Visit checkboxes, cancel extraction button
    - Auto-refresh on extraction completion

### Modified Files

1. **`app/add-bookmark.tsx`**
    - Removed `AIExtractionSection` component (now automatic)
    - Implemented `handleSave()` with platform-specific navigation
    - Queue extraction on save

2. **`src/providers/AppProvider.tsx`**
    - Added `AIExtractionProvider` to provider chain

3. **`app/_layout.tsx`**
    - Added bookmark detail route with card presentation

4. **`src/providers/index.ts`**
    - Exported `AIExtractionProvider` and `useAIExtraction`

5. **`app/trip/[id]/bookmarks.tsx`**
    - Implemented full bookmarks list view for trips

### Dependencies Added

- `@react-native-async-storage/async-storage` - Queue persistence

## Data Flow

### Save Bookmark Flow

```
User shares URL → add-bookmark.tsx
  ↓
1. createBookmark() → Returns bookmarkId
  ↓
2. linkBookmarkToTrips(bookmarkId, tripIds)
  ↓
3. queueExtraction(bookmarkId, content) → Adds to AsyncStorage queue
  ↓
4a. iOS: router.push('/bookmark/[id]')
4b. Android: clearShareData() + BackHandler.exitApp()
```

### Extraction Queue Flow

```
Queue in AsyncStorage
  ↓
AIExtractionProvider loads queue on app start
  ↓
Process first item: status = 'processing'
  ↓
generateText() with bookmarkPrompt + content
  ↓
parseAiJsonResponse() → Extract items array
  ↓
saveAttractions(bookmarkId, items) → Insert to DB
  ↓
Remove from queue, status = 'completed'
  ↓
Process next item (if any)
```

### Bookmark Detail Page Flow

```
Navigate to /bookmark/[id]
  ↓
getBookmarkById(id) → Load bookmark + attractions
  ↓
Check extraction status via useAIExtraction()
  ↓
If processing: Show banner with cancel button
If completed: Display grouped attractions
If empty: Show "No attractions yet"
  ↓
Auto-refresh every 2s when status = 'processing'
```

## Database Schema Usage

### Tables Used

1. **`bookmarks`** - Main bookmark data
    - id, title, description, url, thumbnail_url, source, visited

2. **`attractions`** - AI-extracted locations
    - bookmark_id (FK), title, type, country, location, address, notes, visited

3. **`attraction_tags`** - Tags for each attraction
    - attraction_id (FK), tag

4. **`trip_bookmarks`** - Many-to-many junction
    - trip_id (FK), bookmark_id (FK)

## AI Extraction Details

### Prompt

Uses `bookmarkPrompt` from `src/prompts/bookmark.ts`:

- Extracts travel items (restaurants, sights, shops, activities, hotels)
- Classifies into types: sight, restaurant, shopping, play, hotel
- Extracts: title, location, address, country, tags, notes

### Response Format

```json
{
  "items": [
    {
      "title": "Soup Curry GARAKU",
      "type": "restaurant",
      "country": "Japan",
      "location": "Sapporo",
      "address": "...",
      "tags": [
        "curry",
        "Sapporo",
        "local food"
      ],
      "notes": "Popular soup curry spot..."
    }
  ]
}
```

### Processing

1. Parse JSON response via `parseAiJsonResponse()`
2. Iterate through items array
3. Insert attraction + tags in transaction
4. Update bookmark status

## UI Components

### Bookmark Detail Page Sections

1. **Header Card**
    - Thumbnail image (or placeholder)
    - Source badge (Instagram/Threads/Other)
    - Title, description, URL

2. **Status Banner** (conditional)
    - Queued: "Queued for extraction..."
    - Processing: "Extracting attractions..." + spinner
    - Failed: Error message
    - Cancel button (both queued and processing)

3. **Attractions Section**
    - Empty state: "No attractions extracted yet"
    - Grouped by type with icons/colors:
        - 🔵 Sight - blue
        - 🟠 Restaurant - orange
        - 🟣 Shopping - purple
        - 🟢 Play - green
        - 🩷 Hotel - pink
    - Each attraction card shows:
        - Title, location, address
        - Notes, tags
        - Visit checkbox (toggle)

### Trip Bookmarks Page

- Grid/list of bookmark cards
- Shows thumbnail, title, source badge, attraction count
- Tap to navigate to detail page

## Testing Checklist

### Save Bookmark Flow

- [ ] Save bookmark with trips selected
- [ ] Save bookmark without trips
- [ ] iOS: Navigates to detail page after save
- [ ] Android: Returns to share app after save

### Extraction Queue

- [ ] Queue persists after app restart
- [ ] Processes items sequentially
- [ ] Status updates correctly (queued → processing → completed)
- [ ] Cancel extraction works
- [ ] Failed extraction shows error

### Detail Page

- [ ] Displays bookmark metadata correctly
- [ ] Shows processing banner while extracting
- [ ] Auto-refreshes when extraction completes
- [ ] Groups attractions by type
- [ ] Visit checkboxes work
- [ ] Empty state shows when no attractions

### Trip Bookmarks

- [ ] Lists all bookmarks for trip
- [ ] Shows attraction counts
- [ ] Navigation to detail page works

## Known Limitations

1. **Extraction cannot be stopped mid-process** - Only prevents saving results
2. **No retry mechanism** - Failed extractions require manual re-trigger
3. **No global queue visibility** - Status only visible on individual bookmark pages
4. **No rate limiting** - May overwhelm AI with rapid saves

## Future Enhancements

1. **Retry extraction button** on failed bookmarks
2. **Global queue monitor** - View all pending extractions
3. **Batch processing controls** - Pause/resume queue
4. **Notification on completion** (Android) - Alert when extraction done
5. **Rate limiting** - Delay between extractions
6. **Queue priority** - Move bookmarks up/down in queue
7. **Extraction status field in DB** - Persist status beyond app session
8. **Manual re-extraction** - Re-run AI on existing bookmarks
9. **Edit attractions** - Modify AI-extracted data
10. **Map view** - Show attractions on map

## Usage Example

```typescript
// In any component
import {useAIExtraction} from '../src/providers/AIExtractionProvider';

function MyComponent() {
    const {queueExtraction, getExtractionStatus, cancelExtraction} = useAIExtraction();

    // Queue extraction
    await queueExtraction(bookmarkId, content);

    // Check status
    const status = getExtractionStatus(bookmarkId);
    // Returns: { bookmarkId, status: 'queued' | 'processing' | 'completed' | 'failed', error?: string }

    // Cancel
    cancelExtraction(bookmarkId);
}
```

## Dependencies

- `@react-native-async-storage/async-storage` - Queue persistence
- `ai` - AI SDK
- `@react-native-ai/apple` - Apple Intelligence integration
- `drizzle-orm` - Database ORM
- `expo-router` - Navigation
- `expo-share-intent` - Share extension support

## Notes

- Extraction uses Apple Intelligence (on-device AI)
- Queue is stored in AsyncStorage with key `@extraction_queue`
- Processing is sequential to avoid overwhelming the AI
- Status is tracked in-memory (Map) and not persisted to DB
- Auto-refresh interval is 2 seconds during processing

