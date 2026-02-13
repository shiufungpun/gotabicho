import {getDB} from '../db/db';
import {participants, receiptItems, receiptItemShares, receipts} from '../db/schema';
import {Receipt, ReceiptItemShare, ReceiptWithDetails} from '../types';
import {asc, desc, eq, inArray} from 'drizzle-orm';
import {notifyReceiptChange} from '../services/dataEventEmitter';

export const getReceiptsByTripId = async (tripId: number): Promise<ReceiptWithDetails[]> => {
    const db = await getDB();

    // 1. Get Receipts with payer name
    const receiptsData = await db
        .select({
            id: receipts.id,
            trip_id: receipts.trip_id,
            total_amount: receipts.total_amount,
            currency: receipts.currency,
            paid_by_participant_id: receipts.paid_by_participant_id,
            date: receipts.date,
            store_name: receipts.store_name,
            memo: receipts.memo,
            created_at: receipts.created_at,
            updated_at: receipts.updated_at,
            payer_name: participants.name,
        })
        .from(receipts)
        .leftJoin(participants, eq(receipts.paid_by_participant_id, participants.id))
        .where(eq(receipts.trip_id, tripId))
        .orderBy(desc(receipts.date), desc(receipts.created_at));

    if (receiptsData.length === 0) return [];

    // 2. Get All Items for these receipts
    const receiptIds = receiptsData.map(r => r.id);
    if (receiptIds.length === 0) return [];

    const items = await db
        .select()
        .from(receiptItems)
        .where(inArray(receiptItems.receipt_id, receiptIds))
        .orderBy(asc(receiptItems.order_index));

    // 3. Get All Shares for these items
    const itemIds = items.map(i => i.id);
    let shares: ReceiptItemShare[] = [];
    if (itemIds.length > 0) {
        shares = await db
            .select()
            .from(receiptItemShares)
            .where(inArray(receiptItemShares.receipt_item_id, itemIds));
    }

    // 4. Assemble
    return receiptsData.map(r => ({
        id: r.id,
        trip_id: r.trip_id,
        total_amount: r.total_amount,
        currency: r.currency ?? 'JPY',
        paid_by_participant_id: r.paid_by_participant_id,
        date: r.date ?? '',
        store_name: r.store_name ?? '',
        memo: r.memo ?? undefined,
        created_at: r.created_at ?? Date.now(),
        updated_at: r.updated_at ?? Date.now(),
        payer_name: (r.payer_name as string) ?? '',
        items: items
            .filter(i => i.receipt_id === r.id)
            .map(item => ({
                id: item.id,
                receipt_id: item.receipt_id,
                name: item.name,
                category: (item.category ?? '') as string,
                amount: item.amount,
                memo: item.memo ?? undefined,
                order_index: item.order_index ?? 0,
                created_at: item.created_at ?? Date.now(),
                updated_at: item.updated_at ?? Date.now(),
                shares: shares.filter(s => s.receipt_item_id === item.id)
            }))
    })) as ReceiptWithDetails[];
};

export const getReceiptById = async (receiptId: number): Promise<ReceiptWithDetails | null> => {
    const db = await getDB();

    // 1. Get Receipt with payer name
    const receiptData = await db
        .select({
            id: receipts.id,
            trip_id: receipts.trip_id,
            total_amount: receipts.total_amount,
            currency: receipts.currency,
            paid_by_participant_id: receipts.paid_by_participant_id,
            date: receipts.date,
            store_name: receipts.store_name,
            memo: receipts.memo,
            created_at: receipts.created_at,
            updated_at: receipts.updated_at,
            payer_name: participants.name,
        })
        .from(receipts)
        .leftJoin(participants, eq(receipts.paid_by_participant_id, participants.id))
        .where(eq(receipts.id, receiptId))
        .limit(1);

    if (receiptData.length === 0) return null;
    const receipt = receiptData[0];

    // 2. Get Items
    const items = await db
        .select()
        .from(receiptItems)
        .where(eq(receiptItems.receipt_id, receiptId))
        .orderBy(asc(receiptItems.order_index));

    // 3. Get Shares
    const itemIds = items.map(i => i.id);
    let shares: ReceiptItemShare[] = [];
    if (itemIds.length > 0) {
        shares = await db
            .select()
            .from(receiptItemShares)
            .where(inArray(receiptItemShares.receipt_item_id, itemIds));
    }

    // 4. Assemble
    return {
        id: receipt.id,
        trip_id: receipt.trip_id,
        total_amount: receipt.total_amount,
        currency: receipt.currency ?? 'JPY',
        paid_by_participant_id: receipt.paid_by_participant_id,
        date: receipt.date ?? '',
        store_name: receipt.store_name ?? '',
        memo: receipt.memo ?? undefined,
        created_at: receipt.created_at ?? Date.now(),
        updated_at: receipt.updated_at ?? Date.now(),
        payer_name: (receipt.payer_name as string) ?? '',
        items: items.map(item => ({
            id: item.id,
            receipt_id: item.receipt_id,
            name: item.name,
            category: (item.category ?? '') as string,
            amount: item.amount,
            memo: item.memo ?? undefined,
            order_index: item.order_index ?? 0,
            created_at: item.created_at ?? Date.now(),
            updated_at: item.updated_at ?? Date.now(),
            shares: shares.filter(s => s.receipt_item_id === item.id)
        }))
    } as ReceiptWithDetails;
};

export const createReceipt = async (
    receipt: Omit<Receipt, 'id' | 'created_at' | 'updated_at'>,
    items: {
        name: string;
        category: string;
        amount: number;
        memo?: string;
        participantShares: { participant_id: number; amount: number }[];
    }[]
): Promise<void> => {
    const db = await getDB();
    const now = Date.now();

    try {
        await db.transaction(async (tx) => {
            // 1. Insert Receipt
            const rResult = await tx.insert(receipts).values({
                trip_id: receipt.trip_id,
                total_amount: receipt.total_amount,
                currency: receipt.currency,
                paid_by_participant_id: receipt.paid_by_participant_id,
                date: receipt.date,
                store_name: receipt.store_name,
                memo: receipt.memo || null,
                image_path: receipt.image_path || null,
                created_at: now,
                updated_at: now,
            }).returning({id: receipts.id});

            const receiptId = rResult[0].id;

            // 2. Insert Items
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const iResult = await tx.insert(receiptItems).values({
                    receipt_id: receiptId,
                    name: item.name,
                    category: item.category,
                    amount: item.amount,
                    memo: item.memo || null,
                    order_index: i,
                    created_at: now,
                    updated_at: now,
                }).returning({id: receiptItems.id});

                const itemId = iResult[0].id;

                // 3. Insert Shares
                if (item.participantShares.length > 0) {
                    await tx.insert(receiptItemShares).values(
                        item.participantShares.map(share => ({
                            receipt_item_id: itemId,
                            participant_id: share.participant_id,
                            share_amount: share.amount,
                        }))
                    );
                }
            }
        });
    } catch (e) {
        console.error("Failed to create receipt", e);
        throw e;
    }

    notifyReceiptChange();
};

export const deleteReceipt = async (id: number): Promise<void> => {
    const db = await getDB();
    await db.delete(receipts).where(eq(receipts.id, id));
    notifyReceiptChange();
};

