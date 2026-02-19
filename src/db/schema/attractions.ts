import {index, integer, sqliteTable, text} from 'drizzle-orm/sqlite-core';
import {bookmarks} from './bookmarks';

export const attractions = sqliteTable('attractions', {
    id: integer('id').primaryKey({autoIncrement: true}),
    bookmark_id: integer('bookmark_id')
        .notNull()
        .references(() => bookmarks.id, {onDelete: 'cascade'}),
    title: text('title').notNull(),
    type: text('type').notNull(), // 'sight', 'shopping', or 'play'
    location: text('location'),
    address: text('address'),
    notes: text('notes'),
    visited: integer('visited', {mode: 'boolean'}).default(false),
    created_at: integer('created_at'),
    updated_at: integer('updated_at'),
}, (table) => ({
    bookmarkIdIdx: index('attractions_bookmark_id_idx').on(table.bookmark_id),
    typeIdx: index('attractions_type_idx').on(table.type),
}));

export type Attraction = typeof attractions.$inferSelect;
export type NewAttraction = typeof attractions.$inferInsert;

// Junction table for attraction tags
export const attractionTags = sqliteTable('attraction_tags', {
    id: integer('id').primaryKey({autoIncrement: true}),
    attraction_id: integer('attraction_id')
        .notNull()
        .references(() => attractions.id, {onDelete: 'cascade'}),
    tag: text('tag').notNull(),
    created_at: integer('created_at'),
}, (table) => ({
    attractionIdIdx: index('attraction_tags_attraction_id_idx').on(table.attraction_id),
    tagIdx: index('attraction_tags_tag_idx').on(table.tag),
}));

export type AttractionTag = typeof attractionTags.$inferSelect;
export type NewAttractionTag = typeof attractionTags.$inferInsert;

