import {sqliteTable, integer, text, real} from 'drizzle-orm/sqlite-core';

export const trips = sqliteTable('trips', {
    id: integer('id').primaryKey({autoIncrement: true}),
    name: text('name').notNull(),
    start_date: text('start_date'),
    end_date: text('end_date'),
    base_currency: text('base_currency').default('JPY'),
    total_budget: real('total_budget'),
    created_at: integer('created_at'),
    updated_at: integer('updated_at'),
});

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
