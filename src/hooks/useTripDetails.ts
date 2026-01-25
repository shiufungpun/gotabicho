import { useState, useCallback } from 'react';
import { Trip, ParticipantStats, ExpenseWithDetails, Settlement } from '../types';
import * as TripRepository from '../repositories/tripRepository';
import * as ParticipantRepository from '../repositories/participantRepository';
import * as ExpenseRepository from '../repositories/expenseRepository';
import { calculateParticipantStats, calculateSettlements } from '../services/settlementService';
import { useFocusEffect } from '@react-navigation/native';

export const useTripDetails = (tripId: number) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<ParticipantStats[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRepository.ExpenseWithDetails[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const tripData = await TripRepository.getTripById(tripId);
      const partsData = await ParticipantRepository.getParticipantsByTripId(tripId);
      const expensesData = await ExpenseRepository.getExpensesByTripId(tripId);

      if (tripData) {
        setTrip(tripData);

        // Calculate Stats
        const allShares = expensesData.flatMap(e => e.shares);
        // We cast ExpenseWithDetails to Expense because it extends it, extra props ignored
        const stats = calculateParticipantStats(partsData, expensesData, allShares);
        setParticipants(stats);

        // Calculate Settlements
        const sets = calculateSettlements(stats);
        setSettlements(sets);

        setExpenses(expensesData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return { trip, participants, expenses, settlements, loading, refresh: loadData };
};
