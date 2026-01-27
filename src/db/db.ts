import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDB = async () => {
    if (db) return db;
    db = await SQLite.openDatabaseAsync('gotabicho.db');
    return db;
};

export const initDatabase = async () => {
    const db = await getDB();

    await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      base_currency TEXT DEFAULT 'JPY',
      total_budget REAL,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      budget_total REAL,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      currency TEXT DEFAULT 'JPY',
      paid_by_participant_id INTEGER NOT NULL,
      date TEXT,
      store_name TEXT,
      memo TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (paid_by_participant_id) REFERENCES participants(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS receipt_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      amount REAL NOT NULL,
      memo TEXT,
      order_index INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS receipt_item_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_item_id INTEGER NOT NULL,
      participant_id INTEGER NOT NULL,
      share_amount REAL NOT NULL,
      FOREIGN KEY (receipt_item_id) REFERENCES receipt_items(id) ON DELETE CASCADE,
      FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
    );
  `);
};
