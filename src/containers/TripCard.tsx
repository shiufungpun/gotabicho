import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemedCard, ThemedText} from "../components";
import {useTheme} from '../theme';
import TripActionButtonPanel from "../components/trip/ActionButtonPanel";
import {TripDetails} from "../hooks/useTrips";
import SpentIndicator from "../components/trip/SpentIndicator";

interface TripCardProps {
    trip: TripDetails;
}

const TripCard: React.FC<TripCardProps> = ({trip}) => {
    const navigation = useNavigation<any>();
    const {colors} = useTheme();

    const budget = trip.total_budget || 0;
    const spent = trip.total_expenses || 0;
    const hasBudget = budget > 0;

    // Calculate trip duration
    const calculateDuration = () => {
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    };

    const duration = calculateDuration();

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('TripHome', {tripId: trip.id, title: trip.name})}
        >
            <ThemedCard className="p-5 rounded-lg mb-3">
                <ThemedText textStyle={"subheader"}>{trip.name}</ThemedText>
                <ThemedText variant="secondary" textStyle={"number"} className={"text-lg"}>
                    {trip.start_date} - {trip.end_date} ({duration}日)
                </ThemedText>
                <SpentIndicator trip={trip}/>
                {/* Action Button */}
                <TripActionButtonPanel trip={trip}/>
            </ThemedCard>
        </TouchableOpacity>

    );
};

export default TripCard;
