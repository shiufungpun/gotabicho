import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { trips } from './trips';
export const participants = sqliteTable('participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  trip_id: integer('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  budget_total: real('budget_total'),
  created_at: integer('created_at'),
  updated_at: integer('updated_at'),
});
export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
