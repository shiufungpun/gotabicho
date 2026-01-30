import {getDB} from '../db/db';
import {Trip} from '../types';

export const getAllTrips = async (): Promise<(Trip & { total_expenses: number })[]> => {
    const db = await getDB();
    const result = await db.getAllAsync<Trip & { total_expenses: number }>(`
    SELECT t.*, COALESCE(SUM(r.total_amount), 0) as total_expenses 
    FROM trips t 
    LEFT JOIN receipts r ON t.id = r.trip_id 
    GROUP BY t.id 
    ORDER BY t.created_at DESC
  `);
    return result;
};

export const getTripById = async (id: number): Promise<Trip | null> => {
    const db = await getDB();
    const result = await db.getFirstAsync<Trip>('SELECT * FROM trips WHERE id = ?', [id]);
    return result;
};

export const createTrip = async (trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
    const db = await getDB();
    const now = Date.now();

    let tripId = 0;
    await db.withTransactionAsync(async () => {
        const result = await db.runAsync(
            'INSERT INTO trips (name, start_date, end_date, base_currency, total_budget, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [trip.name, trip.start_date, trip.end_date, trip.base_currency, trip.total_budget ?? null, now, now]
        );
        tripId = result.lastInsertRowId;

        // Create default "You" participant
        await db.runAsync(
            'INSERT INTO participants (trip_id, name, budget_total, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [tripId, 'You', null, now, now]
        );
    });

    return tripId;
};


export const deleteTrip = async (id: number): Promise<void> => {
    const db = await getDB();
    await db.runAsync('DELETE FROM trips WHERE id = ?', [id]);
};

export const getActiveTrip = async (): Promise<(Trip & { total_expenses: number }) | null> => {
    const db = await getDB();
    const today = new Date().toISOString().split('T')[0];

    // First, try to get an ongoing trip (where today is between start and end date)
    let result = await db.getFirstAsync<Trip & { total_expenses: number }>(`
        SELECT t.*, COALESCE(SUM(r.total_amount), 0) as total_expenses 
        FROM trips t 
        LEFT JOIN receipts r ON t.id = r.trip_id 
        WHERE date(t.start_date) <= date(?) AND date(t.end_date) >= date(?)
        GROUP BY t.id 
        ORDER BY t.start_date DESC
        LIMIT 1
    `, [today, today]);

    // If no ongoing trip, get the most recently created trip
    if (!result) {
        result = await db.getFirstAsync<Trip & { total_expenses: number }>(`
            SELECT t.*, COALESCE(SUM(r.total_amount), 0) as total_expenses 
            FROM trips t 
            LEFT JOIN receipts r ON t.id = r.trip_id 
            GROUP BY t.id 
            ORDER BY t.created_at DESC
            LIMIT 1
        `);
    }

    return result || null;
};

