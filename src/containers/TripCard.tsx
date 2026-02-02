import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemedCard, ThemedText} from "../components";
import {Trip} from "../types";
import {useTheme} from '../theme';

interface TripCardProps {
    trip: Trip & { total_expenses: number; participant_count: number; receipt_count: number };
}

const TripCard: React.FC<TripCardProps> = ({trip}) => {
    const navigation = useNavigation<any>();
    const {colors} = useTheme();

    const budget = trip.total_budget || 0;
    const spent = trip.total_expenses || 0;
    const hasBudget = budget > 0;
    const progress = hasBudget ? Math.min(spent / budget, 1) : 0;
    const isOverBudget = hasBudget && spent > budget;

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
            <ThemedCard className="p-4 rounded-lg mb-3">
                <ThemedText textStyle={"subheader"}>{trip.name}</ThemedText>
                {hasBudget && (
                    <ThemedText
                        variant="secondary"
                        className="text-lg font-medium"
                        style={isOverBudget && {color: colors.budgetOver}}
                    >
                        {spent.toLocaleString()} / {budget.toLocaleString()} {trip.base_currency}
                    </ThemedText>
                )}
                <ThemedText variant="secondary" textStyle={"caption"}>
                    {trip.start_date} - {trip.end_date}
                </ThemedText>

                {/* Trip Info Row */}
                <View className="flex-row items-center mt-2 gap-3">
                    <ThemedText variant="tertiary" className="text-sm">
                        {duration} {duration === 1 ? 'day' : 'days'}
                    </ThemedText>
                    <ThemedText variant="tertiary" className="text-sm">
                        •
                    </ThemedText>
                    <ThemedText variant="tertiary" className="text-sm">
                        {trip.participant_count} {trip.participant_count === 1 ? 'person' : 'people'}
                    </ThemedText>
                    <ThemedText variant="tertiary" className="text-sm">
                        •
                    </ThemedText>
                    <ThemedText variant="tertiary" className="text-sm">
                        {trip.receipt_count} {trip.receipt_count === 1 ? 'receipt' : 'receipts'}
                    </ThemedText>
                </View>

                {hasBudget && (
                    <View className="h-1.5 rounded-sm mt-3 overflow-hidden"
                          style={{backgroundColor: colors.progressBackground}}>
                        <View
                            className="h-full rounded-sm"
                            style={{
                                width: `${progress * 100}%`,
                                backgroundColor: isOverBudget ? colors.budgetOver : colors.budgetNormal
                            }}
                        />
                    </View>
                )}
                {!hasBudget && spent > 0 && (
                    <ThemedText variant="secondary">
                        Spent: {spent.toLocaleString()} {trip.base_currency}
                    </ThemedText>
                )}
            </ThemedCard>
        </TouchableOpacity>

    );
};

export default TripCard;
