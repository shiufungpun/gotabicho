import { getDB } from '../db/db';
import { Expense, ExpenseShare } from '../types';

export interface ExpenseWithDetails extends Expense {
  shares: ExpenseShare[];
  paid_by_name: string;
}

export const getExpensesByTripId = async (tripId: number): Promise<ExpenseWithDetails[]> => {
  const db = await getDB();

  // Get expenses with payer name
  const expenses = await db.getAllAsync<Expense & { payer_name: string }>(`
    SELECT e.*, p.name as payer_name 
    FROM expenses e
    LEFT JOIN participants p ON e.paid_by_participant_id = p.id
    WHERE e.trip_id = ? 
    ORDER BY e.date DESC, e.created_at DESC
  `, [tripId]);

  if (expenses.length === 0) return [];

  // Get all shares for these expenses
  // Valid SQL for IN clause with subquery
  const shares = await db.getAllAsync<ExpenseShare>(`
    SELECT * FROM expense_shares 
    WHERE expense_id IN (SELECT id FROM expenses WHERE trip_id = ?)
  `, [tripId]);

  // Combine
  return expenses.map(e => ({
    ...e,
    paid_by_name: e.payer_name,
    shares: shares.filter(s => s.expense_id === e.id)
  }));
};

export const createExpense = async (
  expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>,
  participantIdsToSplit: number[]
): Promise<void> => {
  const db = await getDB();
  const now = Date.now();

  try {
    // using generic transaction if available, or just sequential waits (less safe but MVP ok if single user)
    // Expo SQLite next usually has withTransactionAsync
    // If not, we just run commands.
    // Ensuring atomicity is good.

    await db.withTransactionAsync(async () => {
        const result = await db.runAsync(
            'INSERT INTO expenses (trip_id, amount, currency, category, paid_by_participant_id, date, memo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [expense.trip_id, expense.amount, expense.currency, expense.category, expense.paid_by_participant_id, expense.date, expense.memo, now, now]
        );
        const expenseId = result.lastInsertRowId;

        const shareAmount = expense.amount / participantIdsToSplit.length;

        for (const pId of participantIdsToSplit) {
            await db.runAsync(
                'INSERT INTO expense_shares (expense_id, participant_id, share_amount) VALUES (?, ?, ?)',
                [expenseId, pId, shareAmount]
            );
        }
    });

  } catch (e) {
    console.error("Failed to create expense", e);
    throw e;
  }
};

export const deleteExpense = async (id: number): Promise<void> => {
  const db = await getDB();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
};
