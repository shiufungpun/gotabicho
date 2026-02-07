import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useRouter} from 'expo-router';
import {ThemedCard, ThemedText} from "../components";
import {useTheme} from '../theme';
import SpentIndicator from "../components/trip/SpentIndicator";
import {TripDetails} from "../hooks/useTrips";

interface TripCardProps {
    trip: TripDetails;
}

const CarouselTripCardV2: React.FC<TripCardProps> = ({trip}) => {
    const router = useRouter();
    const {colors} = useTheme();

    const budget = trip.total_budget || 0;
    const spent = trip.total_expenses || 0;
    const hasBudget = budget > 0;

    const isOverBudget = hasBudget && spent > budget;


    return (
        <TouchableOpacity
            // onPress={() => navigation.navigate('TripHome', {tripId: trip.id, title: trip.name})}
        >
            <ThemedCard className="p-8 rounded-lg h-full">
                <ThemedText variant={"primary"} textStyle={"subheader"}>{trip.name}</ThemedText>

                <ThemedText variant="secondary" textStyle={"caption"}>
                    {trip.start_date} - {trip.end_date}
                </ThemedText>
                <ThemedText variant="primary" textStyle={"title"}>
                    總支出：{trip.total_expenses} {trip.base_currency}
                </ThemedText>

                <SpentIndicator trip={trip}/>
                {!hasBudget && spent > 0 && (
                    <ThemedText variant="secondary">
                        Spent: {spent.toLocaleString()} {trip.base_currency}
                    </ThemedText>
                )}
            </ThemedCard>
        </TouchableOpacity>
    );
};

export default CarouselTripCardV2;

