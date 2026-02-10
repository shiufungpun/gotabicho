import {integer, real, sqliteTable, text} from 'drizzle-orm/sqlite-core';
import {receipts} from './receipts';

export const receiptItems = sqliteTable('receipt_items', {
    id: integer('id').primaryKey({autoIncrement: true}),
    receipt_id: integer('receipt_id')
        .notNull()
        .references(() => receipts.id, {onDelete: 'cascade'}),
    name: text('name').notNull(),
    category: text('category'),
    amount: real('amount').notNull(),
    memo: text('memo'),
    order_index: integer('order_index').default(0),
    created_at: integer('created_at'),
    updated_at: integer('updated_at'),
});

export type ReceiptItem = typeof receiptItems.$inferSelect;
export type NewReceiptItem = typeof receiptItems.$inferInsert;
