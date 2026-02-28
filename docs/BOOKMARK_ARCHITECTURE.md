# Bookmark System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Share Intent Layer                        │
│  (Instagram, Threads, Safari) → expo-share-intent → App         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Add Bookmark Screen                         │
│  • Display extracted metadata                                    │
│  • Select trips to link                                          │
│  • Save button triggers flow                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Save Flow                                 │
│  1. createBookmark() → Returns bookmarkId                        │
│  2. linkBookmarkToTrips(bookmarkId, tripIds)                     │
│  3. queueExtraction(bookmarkId, content)                         │
│  4a. iOS: Navigate to /bookmark/[id]                             │
│  4b. Android: Exit app (return to share source)                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   AIExtractionProvider                           │
│  • Maintains queue in AsyncStorage                               │
│  • Processes items sequentially                                  │
│  • Tracks status per bookmark                                    │
│  • Survives app restarts                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AI Processing Loop                            │
│  1. Pop next item from queue                                     │
│  2. generateText(bookmarkPrompt + content)                       │
│  3. parseAiJsonResponse() → Extract items                        │
│  4. saveAttractions(bookmarkId, items)                           │
│  5. Update status to 'completed'                                 │
│  6. Process next item (if any)                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Bookmark Detail Page                          │
│  • Display bookmark metadata                                     │
│  • Show extraction status banner                                 │
│  • List attractions grouped by type                              │
│  • Visit tracking with checkboxes                                │
│  • Auto-refresh when processing                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
App
├── AppProvider
│   ├── ThemeProvider
│   ├── DatabaseProvider
│   └── AIExtractionProvider ← Global extraction queue
│       ├── Queue state (AsyncStorage)
│       ├── Status map (in-memory)
│       └── Processing worker
│
├── ShareIntentHandler ← Monitors for shared URLs
│
└── Stack Navigator
    ├── /index (Home)
    ├── /add-bookmark ← Save bookmark flow
    ├── /bookmark/[id] ← Detail page
    │   ├── Bookmark header
    │   ├── Status banner (processing/error)
    │   └── Attractions list (grouped by type)
    │
    └── /trip/[id]
        ├── /bookmarks ← List bookmarks for trip
        └── ...other tabs
```

## Data Flow Diagram

```
┌──────────────┐
│  User Action │ Share URL from Instagram/Safari
└──────┬───────┘
       ↓
┌──────────────────────┐
│ extractBookmarkMeta  │ Fetch metadata (title, desc, thumbnail)
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│  add-bookmark.tsx    │ Display preview, select trips
└──────┬───────────────┘
       ↓ Save button
┌──────────────────────┐
│  bookmarkRepository  │
│  • createBookmark()  │ Insert to bookmarks table
│  • linkToTrips()     │ Insert to trip_bookmarks table
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ AIExtractionProvider │
│  • queueExtraction() │ Add to AsyncStorage queue
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ Platform Split       │
│  iOS: Navigate       │ router.push('/bookmark/[id]')
│  Android: Exit       │ BackHandler.exitApp()
└──────────────────────┘
       ↓
┌──────────────────────┐
│ Background Process   │ Sequential queue processing
│  • generateText()    │ Apple Intelligence AI
│  • parseResponse()   │ Extract JSON
│  • saveAttractions() │ Insert to attractions + tags tables
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ /bookmark/[id]       │ Display results
│  • getBookmarkById() │ Load bookmark + attractions
│  • getStatus()       │ Check if still processing
│  • Auto-refresh      │ Poll until completed
└──────────────────────┘
```

## Database Schema

```
┌─────────────────────┐
│     bookmarks       │
├─────────────────────┤
│ id (PK)             │
│ title               │
│ description         │
│ url                 │
│ thumbnail_url       │
│ source              │ instagram/threads/other
│ visited             │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│    attractions      │
├─────────────────────┤
│ id (PK)             │
│ bookmark_id (FK)    │ → bookmarks.id
│ title               │
│ type                │ sight/restaurant/shopping/play/hotel
│ country             │
│ location            │
│ address             │
│ notes               │
│ visited             │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│  attraction_tags    │
├─────────────────────┤
│ id (PK)             │
│ attraction_id (FK)  │ → attractions.id
│ tag                 │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│    trip_bookmarks   │ Many-to-many junction
├─────────────────────┤
│ id (PK)             │
│ trip_id (FK)        │ → trips.id
│ bookmark_id (FK)    │ → bookmarks.id
│ created_at          │
└─────────────────────┘
```

## State Management

### Global State (Context)

```typescript
AIExtractionProvider
{
    queue: ExtractionQueueItem[]        // AsyncStorage persisted
    currentProcessing: number | null    // Current bookmark being processed
    statusMap: Map<number, Status>      // In-memory status tracking

    Methods:
        -queueExtraction(bookmarkId, content)
        - cancelExtraction(bookmarkId)
        - getExtractionStatus(bookmarkId)
}
```

### Queue Item Structure

```typescript
interface ExtractionQueueItem {
    bookmarkId: number;
    content: string;
}
```

### Status Structure

```typescript
interface ExtractionStatus {
    bookmarkId: number;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    error?: string;
}
```

## File Organization

```
src/
├── providers/
│   ├── AIExtractionProvider.tsx     ← Queue management
│   ├── AppProvider.tsx               ← Provider composition
│   └── index.ts                      ← Exports
│
├── repositories/
│   └── bookmarkRepository.ts         ← CRUD operations
│
├── services/
│   └── bookmarkHandlers/
│       ├── index.ts                  ← Main entry
│       ├── instagram_handler.ts      ← Instagram metadata
│       ├── threads_handler.ts        ← Threads metadata
│       └── base_handler.ts           ← Generic handler
│
├── prompts/
│   └── bookmark.ts                   ← AI extraction prompt
│
├── db/
│   └── schema/
│       ├── bookmarks.ts              ← Bookmark schema
│       └── attractions.ts            ← Attraction schema
│
└── types/
    └── index.ts                      ← TypeScript interfaces

app/
├── add-bookmark.tsx                  ← Save bookmark flow
├── bookmark/
│   └── index.tsx                      ← Detail page
└── trip/
    └── [id]/
        └── bookmarks.tsx             ← Trip bookmarks list

utils/
└── parseAiResponse.ts                ← JSON parser
```

## Processing States

```
Bookmark Lifecycle:

Created (no attractions)
  ↓
Queued (in AsyncStorage)
  ↓
Processing (AI generating)
  ↓
Completed (attractions saved) OR Failed (error)
  ↓
Viewed (user sees details)
  ↓
Visited (user marks attractions)
```

## Platform Differences

### iOS Flow

```
Share → App opens
  ↓
add-bookmark screen
  ↓
Save button → createBookmark() → queueExtraction()
  ↓
Navigate to /bookmark/[id] (stays in app)
  ↓
User sees "Extracting..." banner
  ↓
Auto-refresh when complete
  ↓
Attractions appear
```

### Android Flow

```
Share → App opens
  ↓
add-bookmark screen
  ↓
Save button → createBookmark() → queueExtraction()
  ↓
Exit app (BackHandler.exitApp())
  ↓
User returns to Instagram/Safari
  ↓
Queue continues processing in background
  ↓
User reopens app later
  ↓
Navigate to bookmark detail → See completed attractions
```

## API Surface

### AIExtractionProvider

```typescript
// Queue extraction
queueExtraction(bookmarkId
:
number, content
:
string
):
Promise<void>

// Check status
getExtractionStatus(bookmarkId
:
number
):
ExtractionStatus | null

// Cancel extraction
cancelExtraction(bookmarkId
:
number
):
void

// Queue info
    currentProcessing
:
number | null
queueLength: number
```

### bookmarkRepository

```typescript
// Create
createBookmark(data)
:
Promise<number>

// Read
getBookmarkById(id)
:
Promise<BookmarkWithAttractions | null>
getBookmarksByTripId(tripId)
:
Promise<BookmarkWithAttractions[]>

// Update
updateAttractionVisited(id, visited)
:
Promise<void>
updateBookmarkVisited(id, visited)
:
Promise<void>

// Delete
deleteBookmark(id)
:
Promise<void>

// Relations
linkBookmarkToTrips(bookmarkId, tripIds)
:
Promise<void>

// AI Integration
saveAttractions(bookmarkId, items)
:
Promise<void>
```

## Performance Considerations

1. **Sequential Processing**: Only one AI extraction at a time to avoid overwhelming the model
2. **AsyncStorage**: Queue persisted to survive crashes/restarts
3. **Auto-refresh**: 2-second polling interval on detail page (stops when completed)
4. **Lazy Loading**: Bookmarks load attractions only when detail page opened
5. **Transaction**: Attraction + tags inserted in single DB transaction

## Error Handling

```typescript
try {
    // AI generation
    const result = await generateText({...});

    // Parse response
    const parsed = parseAiJsonResponse(result.text);

    // Save to DB
    await saveAttractions(bookmarkId, parsed.items);

    // Success
    status = 'completed';
} catch (error) {
    // Log error
    console.error('[AIExtraction]', error);

    // Update status
    status = 'failed';
    error = error.message;
}
```

## Extension Points

1. **New Source**: Add handler in `bookmarkHandlers/`
2. **Custom Prompt**: Modify `src/prompts/bookmark.ts`
3. **Additional Fields**: Extend `attractions` schema
4. **Queue Priority**: Add priority field to queue items
5. **Batch Processing**: Modify worker to process N items concurrently
6. **Retry Logic**: Add retry count to status and auto-retry on failure

