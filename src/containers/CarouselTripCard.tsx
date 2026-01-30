import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemedCard, ThemedText} from "../components";
import {Trip} from "../types";
import {useTheme} from '../theme';

interface TripCardProps {
    trip: Trip & { total_expenses: number };
}

const CarouselTripCard: React.FC<TripCardProps> = ({trip}) => {
    const navigation = useNavigation<any>();
    const {colors} = useTheme();

    const budget = trip.total_budget || 0;
    const spent = trip.total_expenses || 0;
    const hasBudget = budget > 0;
    const progress = hasBudget ? Math.min(spent / budget, 1) : 0;
    const isOverBudget = hasBudget && spent > budget;

    return (
        <TouchableOpacity
            // onPress={() => navigation.navigate('TripHome', {tripId: trip.id, title: trip.name})}
        >
            <ThemedCard className="p-4 rounded-lg h-full">
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

export default CarouselTripCard;
