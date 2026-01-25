import { getDB } from '../db/db';
import { Trip } from '../types';

export const getAllTrips = async (): Promise<Trip[]> => {
  const db = await getDB();
  const result = await db.getAllAsync<Trip>('SELECT * FROM trips ORDER BY created_at DESC');
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
  const result = await db.runAsync(
    'INSERT INTO trips (name, start_date, end_date, base_currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [trip.name, trip.start_date, trip.end_date, trip.base_currency, now, now]
  );
  return result.lastInsertRowId;
};

export const deleteTrip = async (id: number): Promise<void> => {
  const db = await getDB();
  await db.runAsync('DELETE FROM trips WHERE id = ?', [id]);
};
