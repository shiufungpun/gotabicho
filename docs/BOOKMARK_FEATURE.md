# Social Media Bookmark Feature

## Overview

This feature allows users to quickly save bookmarks from social media platforms (Instagram, Threads) by sharing posts
directly to the Gotabicho app. The app extracts metadata from the shared URL and displays a preview screen where users
can optionally link the bookmark to one or more trips.

## Architecture

### Flow Diagram

```
User shares Instagram/Threads post
          ↓
ShareExtension captures URL
          ↓
ShareIntentHandler detects social media URL
          ↓
Shows loading indicator (5s timeout)
          ↓
Calls appropriate handler (instagram_handler/threads_handler)
          ↓
Handler fetches URL and extracts Open Graph metadata
          ↓
Navigates to /add-bookmark with extracted data
          ↓
User sees preview with thumbnail, title, description
          ↓
User can select multiple trips (or none)
          ↓
Logs data to console (DB save not implemented yet)
```

### Components

#### 1. **Type Definitions** (`src/types/index.ts`)

- `Bookmark`: Database schema interface
- `BookmarkSource`: Enum for social media platforms (Instagram, Threads, Other)
- `ExtractedBookmarkData`: Metadata structure returned by handlers
- `detectBookmarkSource(url)`: Helper function to identify platform from URL

#### 2. **Bookmark Handlers** (`src/services/bookmarkHandlers/`)

**base_handler.ts**

- `fetchWithTimeout(url, timeoutMs)`: Fetches URL with 5-second timeout
- `extractMetaTags(html)`: Parses HTML for Open Graph, Twitter, and meta tags
- `extractMetadata(url, source)`: Main extraction logic with fallback

**instagram_handler.ts**

- `extractInstagramMetadata(url)`: Instagram-specific handler
- Supports post and reel URLs

**threads_handler.ts**

- `extractThreadsMetadata(url)`: Threads-specific handler
- Supports various Threads URL formats

**index.ts**

- `extractBookmarkMetadata(url)`: Main entry point that routes to appropriate handler

#### 3. **ShareIntentHandler** (`src/components/share_instent/share_intent.tsx`)

- Detects URL-only shares (no images)
- Identifies social media platforms using `detectBookmarkSource()`
- Shows loading indicator during metadata extraction
- Navigates to `/add-bookmark` on success
- Falls back to receipt flow for non-social media URLs or image shares

#### 4. **Add Bookmark Screen** (`app/add-bookmark.tsx`)

- Displays extracted metadata in a preview card
- Shows thumbnail (if available) or placeholder
- Source badge with platform icon (Instagram/Threads)
- Multi-select trip picker with checkboxes
- Console logs all data on mount and save
- No database persistence yet (preview mode)

## Usage

### Testing Flow

1. **Share from Instagram:**
    - Open Instagram app
    - Find a post or reel
    - Tap share → Share to... → Gotabicho
    - App opens with loading indicator
    - Preview screen appears with post thumbnail and description
    - Select trips or leave unselected
    - Tap Save → Check console for logged data

2. **Share from Threads:**
    - Open Threads app
    - Find a post
    - Tap share → Share to... → Gotabicho
    - Same flow as Instagram

### Console Output

```javascript
// On share detection
[ShareIntentHandler]
Processing
share
intent: {
    webUrl: "https://instagram.com/p/...", files
:
    []
}
[ShareIntentHandler]
Detected
URL
share, checking
for bookmark...
[ShareIntentHandler]
Social
media
URL
detected, extracting
metadata
...

// During extraction
[BookmarkHandler]
Detected
source: instagram
for URL:
https://instagram.com/p/...
    [InstagramHandler]
Processing
Instagram
URL: https://instagram.com/p/...
    [BaseHandler]
Extracting
metadata
from
instagram: https://instagram.com/p/...
    [BaseHandler]
Extracted
meta
tags: {
    og:title: "...", og
:
    image: "...",
...
}
[InstagramHandler]
Extracted
data: {
    title, description, url, source, imageUrl
}

// On screen mount
[Bookmark]
Extracted
metadata: {
    title: "Post title",
        description
:
    "Post description",
        url
:
    "https://instagram.com/p/...",
        source
:
    "instagram",
        imageUrl
:
    "https://..."
}

// On save
[Bookmark]
Save
button
pressed
    [Bookmark]
Selected
trip
IDs: [1, 3, 5]
// or
    [Bookmark]
No
trips
selected - saving
standalone
bookmark
```

## Implementation Details

### URL Detection

```typescript
export function detectBookmarkSource(url: string): BookmarkSource {
    const urlLower = url.toLowerCase();

    if (urlLower.includes('instagram.com')) {
        return BookmarkSource.Instagram;
    }

    if (urlLower.includes('threads.net')) {
        return BookmarkSource.Threads;
    }

    return BookmarkSource.Other;
}
```

### Metadata Extraction Priority

1. **Title:** Open Graph title → Twitter title → HTML title → URL
2. **Description:** Open Graph description → Twitter description → meta description → null
3. **Image:** Open Graph image → Twitter image → null

### Timeout Handling

- All URL fetches have a 5-second timeout
- On timeout or error, falls back to basic URL info
- User still sees preview screen with URL as title

### Trip Selection

- Multi-select interface using checkboxes
- Selected trip IDs stored in state array
- Can save with no trips selected (standalone bookmark)
- Trip names and date ranges displayed for context

## Future Enhancements

### Database Persistence

To implement actual saving:

1. Create `src/repositories/bookmarkRepository.ts`
2. Add methods:
    - `createBookmark(data: Omit<Bookmark, 'id'>): Promise<number>`
    - `linkBookmarkToTrips(bookmarkId: number, tripIds: number[]): Promise<void>`
3. Update `handleSave()` in `add-bookmark.tsx` to call repository methods
4. Add success toast/navigation after save

### Additional Platforms

To add support for TikTok, Twitter, etc.:

1. Create new handler file: `src/services/bookmarkHandlers/tiktok_handler.ts`
2. Follow same pattern:
   ```typescript
   export async function extractTikTokMetadata(url: string): Promise<ExtractedBookmarkData> {
       // Implementation
   }
   ```
3. Update `detectBookmarkSource()` in `src/types/index.ts`:
   ```typescript
   if (urlLower.includes('tiktok.com')) {
       return BookmarkSource.TikTok;
   }
   ```
4. Add case to switch in `src/services/bookmarkHandlers/index.ts`
5. Add icon and color in `add-bookmark.tsx` helper functions

### Enhanced Metadata

- Extract author/username from posts
- Parse post date/time
- Capture hashtags
- Download and cache images locally
- OCR text from images

## Files Modified/Created

### Created

- `src/services/bookmarkHandlers/base_handler.ts`
- `src/services/bookmarkHandlers/instagram_handler.ts`
- `src/services/bookmarkHandlers/threads_handler.ts`
- `src/services/bookmarkHandlers/index.ts`
- `app/add-bookmark.tsx`

### Modified

- `src/types/index.ts` - Added bookmark types and helper function
- `src/components/share_instent/share_intent.tsx` - Added bookmark detection and routing
- `app/_layout.tsx` - Registered add-bookmark route

## Testing Checklist

- [ ] Share Instagram post → Preview appears with correct metadata
- [ ] Share Instagram reel → Preview appears with correct metadata
- [ ] Share Threads post → Preview appears with correct metadata
- [ ] Loading indicator appears during fetch
- [ ] Timeout works (test with slow network)
- [ ] Fallback data works (test with invalid URL)
- [ ] Trip selection works (check/uncheck multiple trips)
- [ ] Save without trips selected logs correctly
- [ ] Console logs all expected data
- [ ] Receipt flow still works (share image)
- [ ] Non-social URLs still go to receipt flow

## Known Limitations

1. **No database persistence yet** - This is intentional for testing
2. **Instagram/Threads may block scraping** - Some URLs may only return basic info
3. **No local image caching** - Remote URLs stored directly
4. **5-second timeout** - Long loading URLs will fallback
5. **Limited platform support** - Only Instagram and Threads for now

## Next Steps

1. Test with real Instagram/Threads URLs
2. Verify console logging works as expected
3. Implement `bookmarkRepository.ts` for persistence
4. Add UI feedback (toast notifications)
5. Implement local image caching if needed
6. Add more social media platforms

