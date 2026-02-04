import React from 'react';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemedCard, ThemedText, ThemedView} from "../components";
import {useTheme} from '../theme';
import {useActiveTrip} from '../hooks/useActiveTrip';

const ActiveTripCard: React.FC = () => {
    const navigation = useNavigation<any>();
    const {colors} = useTheme();
    const {activeTrip: trip, loading} = useActiveTrip();

    if (loading) {
        return (
            <ThemedView className="p-4 items-center">
                <ActivityIndicator size="small" color={colors.primary}/>
            </ThemedView>
        );
    }

    if (!trip) {
        return (
            <ThemedView className="border-2 border-dashed border-gray-300 p-4 rounded-lg mb-3 items-center">
                <ThemedText textStyle="header" variant="secondary" className="mb-1">
                    No Active Trip
                </ThemedText>
                <ThemedText variant="tertiary" className="text-center">
                    Create a new trip to get started
                </ThemedText>
            </ThemedView>
        );
    }


    const budget = trip.total_budget || 0;
    const spent = trip.total_expenses || 0;
    const hasBudget = budget > 0;
    const progress = hasBudget ? Math.min(spent / budget, 1) : 0;
    const isOverBudget = hasBudget && spent > budget;

    return (
        <TouchableOpacity
            onPress={() => router.push(`/trip/${trip.id}`)}
        >
            <ThemedCard className="p-4 rounded-lg mb-3">
                <View className="flex-row justify-between items-center">
                    <ThemedText textStyle={"header"}>{trip.name}</ThemedText>
                    {hasBudget && (
                        <ThemedText
                            variant="secondary"
                            className="text-lg font-medium"
                            style={isOverBudget && {color: colors.budgetOver}}
                        >
                            {spent.toLocaleString()} / {budget.toLocaleString()} {trip.base_currency}
                        </ThemedText>
                    )}
                </View>
                <ThemedText variant="secondary">
                    {trip.start_date} - {trip.end_date}
                </ThemedText>

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

export default ActiveTripCard;
