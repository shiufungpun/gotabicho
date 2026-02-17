import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core';
import {trips} from './trips';

export const bookmarks = sqliteTable('bookmarks', {
    id: integer('id').primaryKey({autoIncrement: true}),
    title: text('title').notNull(),
    description: text('description'),
    url: text('url'),
    thumbnail_url: text('thumbnail_url'),
    source: text('source'),
    visited: integer('visited', {mode: 'boolean'}).default(false),
    created_at: integer('created_at'),
    updated_at: integer('updated_at'),
});

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

// Junction table for many-to-many relationship between trips and bookmarks
export const tripBookmarks = sqliteTable('trip_bookmarks', {
    id: integer('id').primaryKey({autoIncrement: true}),
    trip_id: integer('trip_id')
        .notNull()
        .references(() => trips.id, {onDelete: 'cascade'}),
    bookmark_id: integer('bookmark_id')
        .notNull()
        .references(() => bookmarks.id, {onDelete: 'cascade'}),
    created_at: integer('created_at'),
});

export type TripBookmark = typeof tripBookmarks.$inferSelect;
export type NewTripBookmark = typeof tripBookmarks.$inferInsert;
