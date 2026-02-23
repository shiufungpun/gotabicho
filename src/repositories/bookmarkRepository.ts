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
import {desc, eq, sql} from 'drizzle-orm';

/**
 * Get all bookmarks ordered by created_at DESC, with attraction count
 */
export const getAllBookmarks = async (): Promise<BookmarkWithCount[]> => {
    const db = await getDB();

    const rows = await db
        .select({
            id: bookmarks.id,
            title: bookmarks.title,
            description: bookmarks.description,
            url: bookmarks.url,
            thumbnail_url: bookmarks.thumbnail_url,
            source: bookmarks.source,
            visited: bookmarks.visited,
            created_at: bookmarks.created_at,
            updated_at: bookmarks.updated_at,
            attraction_count: sql<number>`(SELECT COUNT(*) FROM ${attractions} WHERE ${attractions.bookmark_id} = ${bookmarks.id})`,
        })
        .from(bookmarks)
        .orderBy(desc(bookmarks.created_at));

    return rows;
};

/**
 * Get all attractions ordered by created_at DESC, with parent bookmark title
 */
export const getAllAttractions = async (): Promise<AttractionWithBookmark[]> => {
    const db = await getDB();

    const rows = await db
        .select({
            id: attractions.id,
            bookmark_id: attractions.bookmark_id,
            title: attractions.title,
            type: attractions.type,
            country: attractions.country,
            location: attractions.location,
            address: attractions.address,
            notes: attractions.notes,
            visited: attractions.visited,
            created_at: attractions.created_at,
            updated_at: attractions.updated_at,
            bookmark_title: bookmarks.title,
        })
        .from(attractions)
        .innerJoin(bookmarks, eq(attractions.bookmark_id, bookmarks.id))
        .orderBy(desc(attractions.created_at));

    // Fetch tags for each attraction
    const result = await Promise.all(
        rows.map(async (row) => {
            const tags = await db
                .select()
                .from(attractionTags)
                .where(eq(attractionTags.attraction_id, row.id));
            return {
                ...row,
                tags: tags.map(t => t.tag),
            };
        })
    );

    return result;
};

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
 * Update bookmark title
 */
export const updateBookmarkTitle = async (id: number, title: string): Promise<void> => {
    const db = await getDB();
    await db.update(bookmarks).set({title, updated_at: Date.now()}).where(eq(bookmarks.id, id));
    console.log('[BookmarkRepo] Updated bookmark title:', id, title);
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

export interface BookmarkWithCount extends Bookmark {
    attraction_count: number;
}

export interface AttractionWithBookmark extends Attraction {
    bookmark_title: string;
    tags: string[];
}


