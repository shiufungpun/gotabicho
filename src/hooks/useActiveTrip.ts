import {useCallback, useState} from 'react';
import {Trip} from '../types';
import * as TripRepository from '../repositories/tripRepository';
import {useFocusEffect} from '@react-navigation/native';

export const useActiveTrip = () => {
    const [activeTrip, setActiveTrip] = useState<(Trip & { total_expenses: number }) | null>(null);
    const [loading, setLoading] = useState(false);

    const loadActiveTrip = useCallback(async () => {
        setLoading(true);
        try {
            const data = await TripRepository.getActiveTrip();
            setActiveTrip(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadActiveTrip();
        }, [loadActiveTrip])
    );

    return {activeTrip, loading, refresh: loadActiveTrip};
};
