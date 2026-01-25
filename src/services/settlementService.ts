import { Participant, Expense, ExpenseShare, ParticipantStats, Settlement } from '../types';

export const calculateParticipantStats = (
  participants: Participant[],
  expenses: Expense[],
  shares: ExpenseShare[]
): ParticipantStats[] => {
  return participants.map(p => {
    const paid_total = expenses
      .filter(e => e.paid_by_participant_id === p.id)
      .reduce((sum, e) => sum + e.amount, 0);

    const spent_total = shares
      .filter(s => s.participant_id === p.id)
      .reduce((sum, s) => sum + s.share_amount, 0);

    return {
      ...p,
      paid_total,
      spent_total,
      balance: paid_total - spent_total
    };
  });
};

export const calculateSettlements = (stats: ParticipantStats[]): Settlement[] => {
  let debtors = stats.filter(s => s.balance < -0.01).map(s => ({ ...s, balance: s.balance }));
  let creditors = stats.filter(s => s.balance > 0.01).map(s => ({ ...s, balance: s.balance }));

  // Sort by magnitude (largest debt/credit first) to try and minimize transactions (basic greedy)
  debtors.sort((a, b) => a.balance - b.balance); // Ascending (most negative first)
  creditors.sort((a, b) => b.balance - a.balance); // Descending (most positive first)

  const settlements: Settlement[] = [];

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

    // Round to 2 decimals to avoid float epsilon issues
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      settlements.push({
        from_participant_id: debtor.id,
        to_participant_id: creditor.id,
        from_name: debtor.name,
        to_name: creditor.name,
        amount: roundedAmount,
      });
    }

    debtor.balance += roundedAmount;
    creditor.balance -= roundedAmount;

    // If settled, move to next
    if (Math.abs(debtor.balance) < 0.01) {
      i++;
    }
    if (creditor.balance < 0.01) {
      j++;
    }
  }

  return settlements;
};
