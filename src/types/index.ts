export interface Trip {
    id: number;
    name: string;
    start_date: string | null;
    end_date: string | null;
    base_currency: string | null;
    total_budget?: number | null;
    created_at: number | null;
    updated_at: number | null;
}

export interface Participant {
    id: number;
    trip_id: number;
    name: string;
    budget_total: number | null;
    created_at: number | null;
    updated_at: number | null;
}

export interface Receipt {
    id: number;
    trip_id: number;
    total_amount: number;
    currency: string | null;
    paid_by_participant_id: number;
    date: string | null;
    store_name: string | null;
    memo?: string | null;
    image_path?: string | null;
    created_at: number | null;
    updated_at: number | null;
}

export interface ReceiptItem {
    id: number;
    receipt_id: number;
    name: string;
    category: string | null;
    amount: number;
    memo?: string | null;
    order_index: number | null;
    created_at: number | null;
    updated_at: number | null;
}

export interface ReceiptItemShare {
    id: number;
    receipt_item_id: number;
    participant_id: number;
    share_amount: number;
}

// Aggregated types for UI
export interface TripStats {
    total_expenses: number;
}

export interface ParticipantStats extends Participant {
    spent_total: number; // calculated from shares
    paid_total: number;  // calculated from receipts paid
    balance: number;     // paid_total - spent_total (positive means owe me, negative means I owe)
}

export interface Settlement {
    from_participant_id: number;
    to_participant_id: number;
    amount: number;
    from_name: string;
    to_name: string;
}

export interface ReceiptWithDetails extends Receipt {
    payer_name: string;
    items: (ReceiptItem & {
        shares: ReceiptItemShare[];
    })[];
}


