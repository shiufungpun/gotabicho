import React from 'react';
import {ThemedText} from "../components";
import {useTheme} from "../theme";
import {View} from "react-native";

type BudgetCardProps = {
    spent: number;
    budget: number;
    currency: string;
}

const BudgetCard = ({spent, budget, currency = "JPY"}: BudgetCardProps) => {
    const {colors} = useTheme();
    if (budget <= 0 || !budget) {
        return <></>;
    }
    const isOverBudget = spent > budget;
    const progress = Math.min(spent / budget, 1);
    return (
        <>
            <ThemedText
                variant="secondary"
                className="text-lg font-medium"
                style={isOverBudget && {color: colors.budgetOver}}
            >
                {spent.toLocaleString()} / {budget.toLocaleString()} {currency}
            </ThemedText>
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
        </>
    );
};

export default BudgetCard;
