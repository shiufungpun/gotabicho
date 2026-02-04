import {useCallback, useEffect, useState} from 'react';
import {Trip} from '../types';
import * as TripRepository from '../repositories/tripRepository';

export type TripDetails = Trip & {
    total_expenses: number;
    participant_count: number;
    receipt_count: number
}

export const useTrips = () => {
    const [trips, setTrips] = useState<TripDetails[]>([]);
    const [loading, setLoading] = useState(false);

    const loadTrips = useCallback(async () => {
        setLoading(true);
        try {
            const data = await TripRepository.getAllTrips();
            setTrips(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load trips only on initial mount
    useEffect(() => {
        loadTrips();
    }, [loadTrips]);

    return {trips, loading, refresh: loadTrips};
};
