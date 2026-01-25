export interface Trip {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  base_currency: string;
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

export interface Expense {
  id: number;
  trip_id: number;
  amount: number;
  currency: string;
  category: string;
  paid_by_participant_id: number;
  date: string;
  memo: string;
  created_at: number;
  updated_at: number;
}

export interface ExpenseShare {
  id: number;
  expense_id: number;
  participant_id: number;
  share_amount: number;
}

// Aggregated types for UI
export interface TripStats {
  total_expenses: number;
}

export interface ParticipantStats extends Participant {
  spent_total: number; // calculated from shares
  paid_total: number;  // calculated from expenses paid
  balance: number;     // paid_total - spent_total (positive means owe me, negative means I owe)
}

export interface Settlement {
  from_participant_id: number;
  to_participant_id: number;
  amount: number;
  from_name: string;
  to_name: string;
}
