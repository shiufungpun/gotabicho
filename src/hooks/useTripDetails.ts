import {useCallback, useState} from 'react';
import {ParticipantStats, ReceiptWithDetails, Settlement, Trip} from '../types';
import * as TripRepository from '../repositories/tripRepository';
import * as ParticipantRepository from '../repositories/participantRepository';
import * as ReceiptRepository from '../repositories/receiptRepository';
import {calculateParticipantStats, calculateSettlements} from '../services/settlementService';
import {useFocusEffect} from '@react-navigation/native';

export const useTripDetails = (tripId: number) => {
    const [trip, setTrip] = useState<Trip | null>(null);
    const [participants, setParticipants] = useState<ParticipantStats[]>([]);
    const [receipts, setReceipts] = useState<ReceiptWithDetails[]>([]);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        if (!tripId) return;
        setLoading(true);
        try {
            const tripData = await TripRepository.getTripById(tripId);
            const partsData = await ParticipantRepository.getParticipantsByTripId(tripId);
            const receiptsData = await ReceiptRepository.getReceiptsByTripId(tripId);

            if (tripData) {
                setTrip(tripData);

                // Calculate Stats
                const stats = calculateParticipantStats(partsData, receiptsData);
                setParticipants(stats);

                // Calculate Settlements
                const sets = calculateSettlements(stats);
                setSettlements(sets);

                setReceipts(receiptsData);
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

    return {trip, participants, receipts, settlements, loading, refresh: loadData};
};


