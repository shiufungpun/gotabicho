import {getDB} from '../db/db';
import {
    Attraction,
    attractions,
    attractionTags,
    Bookmark,
    bookmarks,
    NewAttraction,
    NewAttractionTag,
    NewBookmark,
    NewTripBookmark,
    tripBookmarks
} from '../db/schema';
import {desc, eq} from 'drizzle-orm';

/**
 * Create a new bookmark
 * @returns the new bookmark ID
 */
export const createBookmark = async (data: Omit<NewBookmark, 'created_at' | 'updated_at'>): Promise<number> => {
    const db = await getDB();
    const now = Date.now();

    const result = await db.insert(bookmarks).values({
        ...data,
        created_at: now,
        updated_at: now,
    }).returning({id: bookmarks.id});

    console.log('[BookmarkRepo] Created bookmark with ID:', result[0].id);
    return result[0].id;
};

/**
 * Get a bookmark by ID with all its attractions
 */
export const getBookmarkById = async (id: number): Promise<BookmarkWithAttractions | null> => {
    const db = await getDB();

    const bookmark = await db.select().from(bookmarks).where(eq(bookmarks.id, id)).limit(1);

    if (!bookmark || bookmark.length === 0) {
        return null;
    }

    const bookmarkAttractions = await db
        .select()
        .from(attractions)
        .where(eq(attractions.bookmark_id, id))
        .orderBy(desc(attractions.created_at));

    // Get tags for each attraction
    const attractionsWithTags = await Promise.all(
        bookmarkAttractions.map(async (attraction) => {
            const tags = await db
                .select()
                .from(attractionTags)
                .where(eq(attractionTags.attraction_id, attraction.id));

            return {
                ...attraction,
                tags: tags.map(t => t.tag),
            };
        })
    );

    return {
        ...bookmark[0],
        attractions: attractionsWithTags,
    };
};

/**
 * Get all bookmarks for a specific trip
 */
export const getBookmarksByTripId = async (tripId: number): Promise<BookmarkWithAttractions[]> => {
    const db = await getDB();

    const tripBookmarkLinks = await db
        .select()
        .from(tripBookmarks)
        .where(eq(tripBookmarks.trip_id, tripId));

    const bookmarkIds = tripBookmarkLinks.map(tb => tb.bookmark_id);

    if (bookmarkIds.length === 0) {
        return [];
    }

    const bookmarkList = await Promise.all(
        bookmarkIds.map(id => getBookmarkById(id))
    );

    return bookmarkList.filter((b): b is BookmarkWithAttractions => b !== null);
};

/**
 * Save extracted attractions from AI to database
 */
export const saveAttractions = async (bookmarkId: number, items: any[]): Promise<void> => {
    const db = await getDB();
    const now = Date.now();

    console.log('[BookmarkRepo] Saving', items.length, 'attractions for bookmark:', bookmarkId);

    await db.transaction(async (tx) => {
        for (const item of items) {
            // Insert attraction
            const attractionData: NewAttraction = {
                bookmark_id: bookmarkId,
                title: item.title,
                type: item.type,
                country: item.country || null,
                location: item.location || null,
                address: item.address || null,
                notes: item.notes || null,
                visited: false,
                created_at: now,
                updated_at: now,
            };

            const result = await tx.insert(attractions).values(attractionData).returning({id: attractions.id});
            const attractionId = result[0].id;

            // Insert tags if present
            if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
                const tagData: NewAttractionTag[] = item.tags.map((tag: string) => ({
                    attraction_id: attractionId,
                    tag,
                    created_at: now,
                }));

                await tx.insert(attractionTags).values(tagData);
            }
        }
    });

    console.log('[BookmarkRepo] Successfully saved attractions');
};

/**
 * Link a bookmark to multiple trips
 */
export const linkBookmarkToTrips = async (bookmarkId: number, tripIds: number[]): Promise<void> => {
    if (tripIds.length === 0) {
        return;
    }

    const db = await getDB();
    const now = Date.now();

    const links: NewTripBookmark[] = tripIds.map(tripId => ({
        trip_id: tripId,
        bookmark_id: bookmarkId,
        created_at: now,
    }));

    await db.insert(tripBookmarks).values(links);
    console.log('[BookmarkRepo] Linked bookmark', bookmarkId, 'to', tripIds.length, 'trips');
};

/**
 * Delete a bookmark and all its associations
 */
export const deleteBookmark = async (id: number): Promise<void> => {
    const db = await getDB();
    await db.delete(bookmarks).where(eq(bookmarks.id, id));
    console.log('[BookmarkRepo] Deleted bookmark:', id);
};

/**
 * Update bookmark visited status
 */
export const updateBookmarkVisited = async (id: number, visited: boolean): Promise<void> => {
    const db = await getDB();
    await db.update(bookmarks).set({visited, updated_at: Date.now()}).where(eq(bookmarks.id, id));
};

/**
 * Update attraction visited status
 */
export const updateAttractionVisited = async (id: number, visited: boolean): Promise<void> => {
    const db = await getDB();
    await db.update(attractions).set({visited, updated_at: Date.now()}).where(eq(attractions.id, id));
};

// Types
export interface AttractionWithTags extends Attraction {
    tags: string[];
}

export interface BookmarkWithAttractions extends Bookmark {
    attractions: AttractionWithTags[];
}


