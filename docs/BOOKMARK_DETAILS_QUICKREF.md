# Bookmark Details Quick Reference

## 📱 User Flow

### Save Bookmark (iOS)

1. Share URL from Instagram/Safari → Opens app
2. Select trips (optional) → Tap "Save"
3. **Navigate to bookmark detail page**
4. See "Extracting attractions..." banner
5. Attractions appear when ready

### Save Bookmark (Android)

1. Share URL from Instagram/Safari → Opens app
2. Select trips (optional) → Tap "Save"
3. **Return to share app automatically**
4. Extraction continues in background
5. Open app later to view bookmark details

## 🔧 Developer Usage

### Queue Extraction

```typescript
import {useAIExtraction} from '../src/providers/AIExtractionProvider';

const {queueExtraction} = useAIExtraction();
await queueExtraction(bookmarkId, contentText);
```

### Check Status

```typescript
const {getExtractionStatus} = useAIExtraction();
const status = getExtractionStatus(bookmarkId);
// { bookmarkId: 1, status: 'queued' | 'processing' | 'completed' | 'failed' }
```

### Cancel Extraction

```typescript
const {cancelExtraction} = useAIExtraction();
cancelExtraction(bookmarkId);
```

## 📂 Key Files

| File                                     | Purpose                            |
|------------------------------------------|------------------------------------|
| `src/providers/AIExtractionProvider.tsx` | Global extraction queue management |
| `src/repositories/bookmarkRepository.ts` | Database operations for bookmarks  |
| `app/bookmark/[id].tsx`                  | Bookmark detail page               |
| `app/add-bookmark.tsx`                   | Save bookmark flow                 |
| `app/trip/[id]/bookmarks.tsx`            | Trip bookmarks list                |

## 🗄️ Database Functions

```typescript
// Create bookmark
const id = await createBookmark({
    title, description, url, thumbnail_url, source, visited: false
});

// Get bookmark with attractions
const bookmark = await getBookmarkById(id);

// Get bookmarks for trip
const bookmarks = await getBookmarksByTripId(tripId);

// Link to trips
await linkBookmarkToTrips(bookmarkId, [tripId1, tripId2]);

// Save AI-extracted attractions
await saveAttractions(bookmarkId, [
    {title: 'Restaurant X', type: 'restaurant', location: 'Tokyo', ...}
]);

// Toggle visited
await updateAttractionVisited(attractionId, true);
```

## 🎨 Attraction Types & Colors

| Type         | Icon               | Color  |
|--------------|--------------------|--------|
| `sight`      | 👁️ eye            | Blue   |
| `restaurant` | 🍽️ restaurant     | Orange |
| `shopping`   | 🛍️ bag            | Purple |
| `play`       | 🎮 game-controller | Green  |
| `hotel`      | 🛏️ bed            | Pink   |

## 🔄 Queue Behavior

- **Persistent**: Survives app restarts (AsyncStorage)
- **Sequential**: One at a time, FIFO order
- **Independent**: Continues even if user navigates away
- **Cancellable**: Can cancel queued or processing items
- **Auto-refresh**: Detail page polls for completion

## 📊 Status Flow

```
User saves bookmark
  ↓
status = 'queued' (added to AsyncStorage)
  ↓
Provider processes next item
  ↓
status = 'processing' (AI generating)
  ↓
Success: status = 'completed' + attractions saved
Failed: status = 'failed' + error message
```

## 🚀 Navigation Routes

```typescript
// Navigate to bookmark detail
router.push(`/bookmark/${bookmarkId}`);

// Trip bookmarks tab
router.push(`/trip/${tripId}/bookmarks`);
```

## 🧪 Testing Scenarios

1. **Queue persistence**: Save bookmark → Kill app → Reopen → Extraction continues
2. **Multiple bookmarks**: Save 3 bookmarks rapidly → All process sequentially
3. **Cancel**: Start extraction → Navigate to detail → Tap "Cancel"
4. **Empty state**: View bookmark before extraction completes
5. **Visit tracking**: Tap checkboxes on attractions
6. **Platform behavior**: Test iOS navigation vs Android exit

## ⚠️ Limitations

- Cannot stop AI mid-generation (only prevents saving)
- No retry button for failed extractions
- Status not persisted to database
- No global queue visibility UI

## 🐛 Debugging

```typescript
// Enable logs
console.log('[AIExtraction]', message);
console.log('[BookmarkRepo]', message);
console.log('[BookmarkDetail]', message);

// Check AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const queue = await AsyncStorage.getItem('@extraction_queue');
console.log('Queue:', JSON.parse(queue));
```

## 📝 AI Response Format

```json
{
  "items": [
    {
      "title": "Soup Curry GARAKU",
      "type": "restaurant",
      "country": "Japan",
      "location": "Sapporo",
      "address": "123 Main St",
      "tags": [
        "curry",
        "local"
      ],
      "notes": "Popular spot for soup curry"
    }
  ]
}
```

## 🔗 Related Files

- `src/prompts/bookmark.ts` - AI extraction prompt
- `utils/parseAiResponse.ts` - JSON parser
- `src/db/schema/bookmarks.ts` - Bookmark schema
- `src/db/schema/attractions.ts` - Attraction schema
- `src/types/index.ts` - TypeScript interfaces

