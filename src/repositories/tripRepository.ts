import {getDB} from '../db/db';
import {participants, receipts, trips} from '../db/schema';
import {Trip} from '../types';
import {desc, eq, sql} from 'drizzle-orm';
import {TripDetails} from "../hooks/useTrips";

const selectTripWithStats = {
    id: trips.id,
    name: trips.name,
    start_date: trips.start_date,
    end_date: trips.end_date,
    base_currency: trips.base_currency,
    total_budget: trips.total_budget,
    created_at: trips.created_at,
    updated_at: trips.updated_at,
    total_expenses: sql<number>`COALESCE(SUM(${receipts.total_amount}), 0)`.as('total_expenses'),
    receipt_count: sql<number>`COUNT(DISTINCT ${receipts.id})`.as('receipt_count'),
    participant_count: sql<number>`(SELECT COUNT(*) FROM ${participants} WHERE ${participants.trip_id} = ${trips.id})`.as('participant_count'),
}


export const getAllTrips = async (): Promise<TripDetails[]> => {
    const db = await getDB();
    return await db
        .select(selectTripWithStats)
        .from(trips)
        .leftJoin(receipts, eq(trips.id, receipts.trip_id))
        .groupBy(trips.id)
        .orderBy(desc(trips.created_at));
};

export const getTripById = async (id: number): Promise<TripDetails | null> => {
    const db = await getDB();
    const result = await db.select(selectTripWithStats).from(trips).where(eq(trips.id, id)).limit(1);
    return (result[0] as TripDetails) || null;
};

export const createTrip = async (trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
    const db = await getDB();
    const now = Date.now();

    let tripId = 0;
    await db.transaction(async (tx) => {
        const result = await tx.insert(trips).values({
            name: trip.name,
            start_date: trip.start_date,
            end_date: trip.end_date,
            base_currency: trip.base_currency,
            total_budget: trip.total_budget ?? null,
            created_at: now,
            updated_at: now,
        }).returning({id: trips.id});

        tripId = result[0].id;

        // Create default "You" participant
        await tx.insert(participants).values({
            trip_id: tripId,
            name: 'You',
            budget_total: null,
            created_at: now,
            updated_at: now,
        });
    });

    return tripId;
};


export const deleteTrip = async (id: number): Promise<void> => {
    const db = await getDB();
    await db.delete(trips).where(eq(trips.id, id));
};

export const getActiveTrip = async (): Promise<(Trip & { total_expenses: number }) | null> => {
    const db = await getDB();
    const today = new Date().toISOString().split('T')[0];

    // First, try to get an ongoing trip (where today is between start and end date)
    let result = await db
        .select({
            id: trips.id,
            name: trips.name,
            start_date: trips.start_date,
            end_date: trips.end_date,
            base_currency: trips.base_currency,
            total_budget: trips.total_budget,
            created_at: trips.created_at,
            updated_at: trips.updated_at,
            total_expenses: sql<number>`COALESCE(SUM(${receipts.total_amount}), 0)`.as('total_expenses'),
        })
        .from(trips)
        .leftJoin(receipts, eq(trips.id, receipts.trip_id))
        .where(
            sql`date(${trips.start_date}) <= date(${today}) AND date(${trips.end_date}) >= date(${today})`
        )
        .groupBy(trips.id)
        .orderBy(desc(trips.start_date))
        .limit(1);

    // If no ongoing trip, get the most recently created trip
    if (result.length === 0) {
        result = await db
            .select({
                id: trips.id,
                name: trips.name,
                start_date: trips.start_date,
                end_date: trips.end_date,
                base_currency: trips.base_currency,
                total_budget: trips.total_budget,
                created_at: trips.created_at,
                updated_at: trips.updated_at,
                total_expenses: sql<number>`COALESCE(SUM(${receipts.total_amount}), 0)`.as('total_expenses'),
            })
            .from(trips)
            .leftJoin(receipts, eq(trips.id, receipts.trip_id))
            .groupBy(trips.id)
            .orderBy(desc(trips.created_at))
            .limit(1);
    }

    return (result[0] as (Trip & { total_expenses: number })) || null;
};

