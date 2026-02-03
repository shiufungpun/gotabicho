import React from 'react';
import {useTheme} from "../../theme";
import {TripDetails} from "../../hooks/useTrips";
import {View} from "react-native";
import {ThemedText} from "../ThemedText";
import {BookmarkIcon, ReceiptJapaneseYenIcon, UsersIcon} from "lucide-react-native";

type SpentIndicatorProps = {
    trip: TripDetails
}
const SpentIndicator = ({trip}: SpentIndicatorProps) => {
    const {colors} = useTheme();
    const budget = trip.total_budget || 0;
    const spent = trip.total_expenses || 0;
    const hasBudget = budget > 0;
    const progress = hasBudget ? Math.min(spent / budget, 1) : 0;
    const isOverBudget = hasBudget && spent > budget;

    const countInfo = () => {
        return (
            <>
                <View className={"flex-row gap-3"}>
                    <View className="flex-row items-center gap-2">
                        <ReceiptJapaneseYenIcon style={{color: colors.text}} size={22}/>
                        <ThemedText variant="primary" textStyle={"body"}>{trip.receipt_count}</ThemedText>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <UsersIcon style={{color: colors.text}} size={22}/>
                        <ThemedText variant="primary" textStyle={"body"}>{trip.participant_count}</ThemedText>
                    </View><View className="flex-row items-center gap-2">
                    <BookmarkIcon style={{color: colors.text}} size={22}/>
                    <ThemedText variant="primary" textStyle={"body"}>{0}</ThemedText>
                </View>
                </View>
            </>
        );
    };
    return (
        <View className={"flex-col gap-1 my-2"}>
            <View className={"flex-row justify-end items-baseline gap-3"}>
                <ThemedText textStyle={"number"} className={"text-2xl"}>{trip.base_currency} </ThemedText>
                <ThemedText textStyle={"number"} className={"text-5xl"}>{spent.toLocaleString()}</ThemedText>
            </View>
            <View className="h-1.5 rounded-sm mb-2 overflow-hidden"
                  style={{backgroundColor: colors.progressBackground}}>
                <View
                    className="h-full rounded-sm"
                    style={{
                        width: `${progress * 100}%`,
                        backgroundColor: isOverBudget ? colors.budgetOver : colors.budgetNormal
                    }}
                />
            </View>
            <View className="flex-row justify-between items-end">
                {countInfo()}
                {hasBudget &&
                    <ThemedText textStyle={"number"}
                                className={"text-xl"}>/ {budget.toLocaleString()}</ThemedText>
                }
            </View>
        </View>
    );
};

export default SpentIndicator;
