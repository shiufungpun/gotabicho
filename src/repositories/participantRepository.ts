import {getDB} from '../db/db';
import {Participant} from '../types';

export const getParticipantsByTripId = async (tripId: number): Promise<Participant[]> => {
    const db = await getDB();
    return await db.getAllAsync<Participant>('SELECT * FROM participants WHERE trip_id = ? ORDER BY created_at ASC', [tripId]);
};

export const createParticipant = async (participant: Omit<Participant, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
    const db = await getDB();
    const now = Date.now();
    const result = await db.runAsync(
        'INSERT INTO participants (trip_id, name, budget_total, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [participant.trip_id, participant.name, participant.budget_total || null, now, now]
    );
    return result.lastInsertRowId;
};

export const updateParticipantBudget = async (id: number, budget_total: number | null): Promise<void> => {
    const db = await getDB();
    const now = Date.now();
    await db.runAsync(
        'UPDATE participants SET budget_total = ?, updated_at = ? WHERE id = ?',
        [budget_total, now, id]
    );
};

export const deleteParticipant = async (id: number): Promise<void> => {
    const db = await getDB();
    // Check if it's "You"
    const participant = await db.getFirstAsync<Participant>('SELECT * FROM participants WHERE id = ?', [id]);
    if (participant && participant.name === 'You') {
        throw new Error("Cannot delete the default 'You' participant.");
    }
    await db.runAsync('DELETE FROM participants WHERE id = ?', [id]);
};
