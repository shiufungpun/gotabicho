import {getSQLiteDB} from './db';

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

/**
 * Create bookmarks table if it doesn't exist
 * This is a migration helper for existing databases
 */
export async function migrateBookmarksTable(): Promise<void> {
    try {
        const db = await getSQLiteDB();

        // Check if table exists
        const tables = await db.getAllAsync(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='bookmarks'"
        );

        if (tables.length === 0) {
            console.log('[Migration] Creating bookmarks table');
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS bookmarks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    url TEXT NOT NULL,
                    source TEXT,
                    visited INTEGER DEFAULT 0,
                    created_at INTEGER,
                    updated_at INTEGER
                )
            `);
            console.log('[Migration] Successfully created bookmarks table');
        } else {
            console.log('[Migration] bookmarks table already exists');

            // Check if old schema has trip_id column
            const tableInfo = await db.getAllAsync('PRAGMA table_info(bookmarks)');
            const hasTripId = tableInfo.some((col: any) => col.name === 'trip_id');

            if (hasTripId) {
                console.log('[Migration] Migrating bookmarks table from one-to-many to many-to-many relationship');

                // Create new bookmarks table without trip_id
                await db.execAsync(`
                    CREATE TABLE bookmarks_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        description TEXT,
                        url TEXT NOT NULL,
                        source TEXT,
                        visited INTEGER DEFAULT 0,
                        created_at INTEGER,
                        updated_at INTEGER
                    );
                    
                    -- Copy data without trip_id
                    INSERT INTO bookmarks_new (id, title, description, url, source, visited, created_at, updated_at)
                    SELECT id, title, description, url, source, visited, created_at, updated_at
                    FROM bookmarks;
                    
                    -- Store old trip associations for junction table
                    CREATE TEMP TABLE temp_trip_bookmarks AS
                    SELECT trip_id, id as bookmark_id, created_at
                    FROM bookmarks;
                    
                    -- Drop old table and rename new one
                    DROP TABLE bookmarks;
                    ALTER TABLE bookmarks_new RENAME TO bookmarks;
                `);
                console.log('[Migration] Successfully migrated bookmarks table structure');
            }
        }

        // Create trip_bookmarks junction table
        const junctionTables = await db.getAllAsync(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='trip_bookmarks'"
        );

        if (junctionTables.length === 0) {
            console.log('[Migration] Creating trip_bookmarks junction table');
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS trip_bookmarks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    trip_id INTEGER NOT NULL,
                    bookmark_id INTEGER NOT NULL,
                    created_at INTEGER,
                    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
                    FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE
                );
                
                -- Migrate old associations if they exist
                INSERT OR IGNORE INTO trip_bookmarks (trip_id, bookmark_id, created_at)
                SELECT trip_id, bookmark_id, created_at
                FROM temp_trip_bookmarks
                WHERE EXISTS (SELECT 1 FROM sqlite_temp_master WHERE type='table' AND name='temp_trip_bookmarks');
                
                -- Clean up temp table if it exists
                DROP TABLE IF EXISTS temp_trip_bookmarks;
            `);
            console.log('[Migration] Successfully created trip_bookmarks junction table');
        } else {
            console.log('[Migration] trip_bookmarks table already exists');
        }
    } catch (error) {
        console.error('[Migration] Error creating bookmarks tables:', error);
        // Don't throw - allow app to continue
    }
}

/**
 * Create attractions and attraction_tags tables if they don't exist
 * This is a migration helper for existing databases
 */
export async function migrateAttractionsTable(): Promise<void> {
    try {
        const db = await getSQLiteDB();

        // Check if attractions table exists
        const tables = await db.getAllAsync(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='attractions'"
        );

        if (tables.length === 0) {
            console.log('[Migration] Creating attractions table');
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS attractions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bookmark_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    type TEXT NOT NULL,
                    location TEXT,
                    address TEXT,
                    notes TEXT,
                    visited INTEGER DEFAULT 0,
                    created_at INTEGER,
                    updated_at INTEGER,
                    FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE
                );
                
                -- Create indexes for better query performance
                CREATE INDEX IF NOT EXISTS attractions_bookmark_id_idx ON attractions(bookmark_id);
                CREATE INDEX IF NOT EXISTS attractions_type_idx ON attractions(type);
            `);
            console.log('[Migration] Successfully created attractions table');
        } else {
            console.log('[Migration] attractions table already exists');
        }

        // Check if attraction_tags table exists
        const tagTables = await db.getAllAsync(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='attraction_tags'"
        );

        if (tagTables.length === 0) {
            console.log('[Migration] Creating attraction_tags table');
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS attraction_tags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    attraction_id INTEGER NOT NULL,
                    tag TEXT NOT NULL,
                    created_at INTEGER,
                    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE
                );
                
                -- Create indexes for better query performance
                CREATE INDEX IF NOT EXISTS attraction_tags_attraction_id_idx ON attraction_tags(attraction_id);
                CREATE INDEX IF NOT EXISTS attraction_tags_tag_idx ON attraction_tags(tag);
            `);
            console.log('[Migration] Successfully created attraction_tags table');
        } else {
            console.log('[Migration] attraction_tags table already exists');
        }
    } catch (error) {
        console.error('[Migration] Error creating attractions tables:', error);
        // Don't throw - allow app to continue
    }
}


