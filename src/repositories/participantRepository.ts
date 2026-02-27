import {getDB} from '../db/db';
import {participants} from '../db/schema';
import {Participant} from '../types';
import {asc, eq} from 'drizzle-orm';

export const getParticipantsByTripId = async (tripId: number): Promise<Participant[]> => {
    const db = await getDB();
    return await db.select().from(participants).where(eq(participants.trip_id, tripId)).orderBy(asc(participants.created_at)) as Participant[];
};

export const createParticipant = async (participant: Omit<Participant, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
    const db = await getDB();
    const now = Date.now();
    const result = await db.insert(participants).values({
        trip_id: participant.trip_id,
        name: participant.name,
        budget_total: participant.budget_total || null,
        created_at: now,
        updated_at: now,
    }).returning({id: participants.id});

    return result[0].id;
};

export const updateParticipantBudget = async (id: number, budget_total: number | null): Promise<void> => {
    const db = await getDB();
    const now = Date.now();
    await db.update(participants)
        .set({budget_total, updated_at: now})
        .where(eq(participants.id, id));
};

export const updateParticipant = async (
    id: number,
    fields: { name: string; budget_total: number | null },
): Promise<void> => {
    const db = await getDB();
    await db.update(participants)
        .set({name: fields.name, budget_total: fields.budget_total, updated_at: Date.now()})
        .where(eq(participants.id, id));
};

export const deleteParticipant = async (id: number): Promise<void> => {
    const db = await getDB();
    // Check if it's "You"
    const participant = await db.select().from(participants).where(eq(participants.id, id)).limit(1);
    if (participant[0] && participant[0].name === 'You') {
        throw new Error("Cannot delete the default 'You' participant.");
    }
    await db.delete(participants).where(eq(participants.id, id));
};
