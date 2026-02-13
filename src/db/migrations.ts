import {getSQLiteDB} from '../db/db';

/**
 * Add image_path column to receipts table if it doesn't exist
 * This is a migration helper for existing databases
 */
export async function migrateReceiptsImagePath(): Promise<void> {
    try {
        const db = await getSQLiteDB();

        // Check if column exists
        const tableInfo = await db.getAllAsync('PRAGMA table_info(receipts)');
        const hasImagePath = tableInfo.some((col: any) => col.name === 'image_path');

        if (!hasImagePath) {
            console.log('[Migration] Adding image_path column to receipts table');
            await db.execAsync('ALTER TABLE receipts ADD COLUMN image_path TEXT');
            console.log('[Migration] Successfully added image_path column');
        } else {
            console.log('[Migration] image_path column already exists');
        }
    } catch (error) {
        console.error('[Migration] Error migrating receipts table:', error);
        // Don't throw - allow app to continue
    }
}
