import {integer, real, sqliteTable, text} from 'drizzle-orm/sqlite-core';
import {trips} from './trips';
import {participants} from './participants';

export const receipts = sqliteTable('receipts', {
    id: integer('id').primaryKey({autoIncrement: true}),
    trip_id: integer('trip_id')
        .notNull()
        .references(() => trips.id, {onDelete: 'cascade'}),
    total_amount: real('total_amount').notNull(),
    currency: text('currency').default('JPY'),
    paid_by_participant_id: integer('paid_by_participant_id')
        .notNull()
        .references(() => participants.id, {onDelete: 'restrict'}),
    date: text('date'),
    store_name: text('store_name'),
    memo: text('memo'),
    created_at: integer('created_at'),
    updated_at: integer('updated_at'),
});

export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;
