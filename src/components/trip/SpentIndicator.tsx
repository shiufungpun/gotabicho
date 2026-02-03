import React from 'react';
import {ThemedText} from "../ThemedText";
import {useTheme} from "../../theme";
import {TripDetails} from "../../hooks/useTrips";

type SpentIndicatorProps = {
    trip: TripDetails
}
const SpentIndicator = ({trip}: SpentIndicatorProps) => {
    const {colors} = useTheme();
    const budget = trip.total_budget || 0;
    const spent = trip.total_expenses || 0;
    const hasBudget = budget > 0;
    const isOverBudget = hasBudget && spent > budget;

    return (
        <>
            {/*{hasBudget && (*/}
            {/*    <ThemedText*/}
            {/*        variant="secondary"*/}
            {/*        style={isOverBudget && {color: colors.budgetOver}}*/}
            {/*    >*/}
            {/*        {spent.toLocaleString()} / {budget.toLocaleString()} {trip.base_currency}*/}
            {/*    </ThemedText>*/}
            {/*)}*/}
            <ThemedText textStyle={"title"}>{spent}</ThemedText>
        </>
    );
};

export default SpentIndicator;
