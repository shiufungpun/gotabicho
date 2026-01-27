export interface Trip {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    base_currency: string;
    total_budget?: number | null;
    created_at: number;
    updated_at: number;
}

export interface Participant {
    id: number;
    trip_id: number;
    name: string;
    budget_total: number | null;
    created_at: number;
    updated_at: number;
}

export interface Receipt {
    id: number;
    trip_id: number;
    total_amount: number;
    currency: string;
    paid_by_participant_id: number;
    date: string; // ISO string
    store_name: string;
    memo?: string;
    created_at: number;
    updated_at: number;
}

export interface ReceiptItem {
    id: number;
    receipt_id: number;
    name: string;
    category: string;
    amount: number;
    memo?: string;
    order_index: number;
    created_at: number;
    updated_at: number;
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


