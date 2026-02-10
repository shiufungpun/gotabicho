import {integer, real, sqliteTable} from 'drizzle-orm/sqlite-core';
import {receiptItems} from './receipt_items';
import {participants} from './participants';

export const receiptItemShares = sqliteTable('receipt_item_shares', {
    id: integer('id').primaryKey({autoIncrement: true}),
    receipt_item_id: integer('receipt_item_id')
        .notNull()
        .references(() => receiptItems.id, {onDelete: 'cascade'}),
    participant_id: integer('participant_id')
        .notNull()
        .references(() => participants.id, {onDelete: 'cascade'}),
    share_amount: real('share_amount').notNull(),
});

export type ReceiptItemShare = typeof receiptItemShares.$inferSelect;
export type NewReceiptItemShare = typeof receiptItemShares.$inferInsert;
