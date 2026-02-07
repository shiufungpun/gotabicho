import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useRouter} from 'expo-router';
import {ThemedCard, ThemedText} from "../components";
import TripActionButtonPanel from "../components/trip/ActionButtonPanel";
import {TripDetails} from "../hooks/useTrips";
import SpentIndicator from "../components/trip/SpentIndicator";
import {calculateDuration} from "../helpers/helpers";

interface TripCardProps {
    trip: TripDetails;
}

export function tripCardContent(trip: TripDetails) {
    const duration = calculateDuration(trip.start_date as string, trip.end_date as string);
    return (
        <>
            <ThemedText textStyle={"subheader"}>{trip.name}</ThemedText>
            <ThemedText variant="secondary" textStyle={"number"} className={"text-lg"}>
                {trip.start_date} - {trip.end_date} ({duration}日)
            </ThemedText>
            <SpentIndicator trip={trip}/>
            {/* Action Button */}
            <TripActionButtonPanel trip={trip}/>
        </>
    )
}

const TripCard: React.FC<TripCardProps> = ({trip}) => {
    const router = useRouter();
    return (
        <TouchableOpacity
            onPress={() => router.push(`/trip/${trip.id}`)}
        >
            <ThemedCard>
                {tripCardContent(trip)}
            </ThemedCard>
        </TouchableOpacity>

    );
};

export default TripCard;
