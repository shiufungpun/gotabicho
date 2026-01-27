import {getDB} from '../db/db';
import {Receipt, ReceiptItem, ReceiptItemShare, ReceiptWithDetails} from '../types';

export const getReceiptsByTripId = async (tripId: number): Promise<ReceiptWithDetails[]> => {
    const db = await getDB();

    // 1. Get Receipts
    const receipts = await db.getAllAsync<Receipt & { payer_name: string }>(`
    SELECT r.*, p.name as payer_name 
    FROM receipts r
    LEFT JOIN participants p ON r.paid_by_participant_id = p.id
    WHERE r.trip_id = ? 
    ORDER BY r.date DESC, r.created_at DESC
  `, [tripId]);

    if (receipts.length === 0) return [];

    // 2. Get All Items for these receipts
    const receiptIds = receipts.map(r => r.id);
    if (receiptIds.length === 0) return [];

    const placeHolders = receiptIds.map(() => '?').join(',');
    const items = await db.getAllAsync<ReceiptItem>(`
        SELECT * FROM receipt_items 
        WHERE receipt_id IN (${placeHolders})
        ORDER BY order_index ASC
    `, receiptIds);

    // 3. Get All Shares for these items
    const itemIds = items.map(i => i.id);
    let shares: ReceiptItemShare[] = [];
    if (itemIds.length > 0) {
        const itemPlaceHolders = itemIds.map(() => '?').join(',');
        shares = await db.getAllAsync<ReceiptItemShare>(`
            SELECT * FROM receipt_item_shares
            WHERE receipt_item_id IN (${itemPlaceHolders})
        `, itemIds);
    }

    // 4. Assemble
    return receipts.map(r => {
        const myItems = items.filter(i => i.receipt_id === r.id);
        const myItemsWithShares = myItems.map(item => ({
            ...item,
            shares: shares.filter(s => s.receipt_item_id === item.id)
        }));

        return {
            ...r,
            payer_name: r.payer_name,
            items: myItemsWithShares
        };
    });
};

export const getReceiptById = async (receiptId: number): Promise<ReceiptWithDetails | null> => {
    const db = await getDB();

    // 1. Get Receipt
    const receipt = await db.getFirstAsync<Receipt & { payer_name: string }>(`
    SELECT r.*, p.name as payer_name 
    FROM receipts r
    LEFT JOIN participants p ON r.paid_by_participant_id = p.id
    WHERE r.id = ?
  `, [receiptId]);

    if (!receipt) return null;

    // 2. Get Items
    const items = await db.getAllAsync<ReceiptItem>(`
        SELECT * FROM receipt_items 
        WHERE receipt_id = ?
        ORDER BY order_index ASC
    `, [receiptId]);

    // 3. Get Shares
    const itemIds = items.map(i => i.id);
    let shares: ReceiptItemShare[] = [];
    if (itemIds.length > 0) {
        const itemPlaceHolders = itemIds.map(() => '?').join(',');
        shares = await db.getAllAsync<ReceiptItemShare>(`
            SELECT * FROM receipt_item_shares
            WHERE receipt_item_id IN (${itemPlaceHolders})
        `, itemIds);
    }

    // 4. Assemble
    const myItemsWithShares = items.map(item => ({
        ...item,
        shares: shares.filter(s => s.receipt_item_id === item.id)
    }));

    return {
        ...receipt,
        payer_name: receipt.payer_name,
        items: myItemsWithShares
    };
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
        await db.withTransactionAsync(async () => {
            // 1. Insert Receipt
            const rResult = await db.runAsync(
                `INSERT INTO receipts (trip_id, total_amount, currency, paid_by_participant_id, date, store_name, memo, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [receipt.trip_id, receipt.total_amount, receipt.currency, receipt.paid_by_participant_id, receipt.date, receipt.store_name, receipt.memo || null, now, now]
            );
            const receiptId = rResult.lastInsertRowId;

            // 2. Insert Items
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const iResult = await db.runAsync(
                    `INSERT INTO receipt_items (receipt_id, name, category, amount, memo, order_index, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [receiptId, item.name, item.category, item.amount, item.memo || null, i, now, now]
                );
                const itemId = iResult.lastInsertRowId;

                // 3. Insert Shares
                for (const share of item.participantShares) {
                    await db.runAsync(
                        `INSERT INTO receipt_item_shares (receipt_item_id, participant_id, share_amount)
             VALUES (?, ?, ?)`,
                        [itemId, share.participant_id, share.amount]
                    );
                }
            }
        });
    } catch (e) {
        console.error("Failed to create receipt", e);
        throw e;
    }
};

export const deleteReceipt = async (id: number): Promise<void> => {
    const db = await getDB();
    await db.runAsync('DELETE FROM receipts WHERE id = ?', [id]);
};

