import React from 'react';
import {StyleSheet, Text} from 'react-native';
import Animated from 'react-native-reanimated';
import {tripCardContent} from '../TripCard';
import {TripDetails} from '../../hooks/useTrips';

interface TripDetailsHeaderProps {
    trip: TripDetails;
    totalSpent: number;
    headerAnimatedStyle: object;
    contentOpacityStyle: object;
    smallHeaderOpacityStyle: object;
    cardBackgroundColor: string;
    paddingTop: number;
}

/**
 * Animated collapsible header for the trip details screen.
 * Shows full trip card content when expanded, and a minimal summary when collapsed.
 */
const TripDetailsHeader: React.FC<TripDetailsHeaderProps> = ({
                                                                 trip,
                                                                 totalSpent,
                                                                 headerAnimatedStyle,
                                                                 contentOpacityStyle,
                                                                 smallHeaderOpacityStyle,
                                                                 cardBackgroundColor,
                                                                 paddingTop,
                                                             }) => {
    return (
        <Animated.View
            style={[headerAnimatedStyle, {backgroundColor: cardBackgroundColor}]}
            className="m-5 rounded-3xl overflow-hidden"
        >
            {/* Full card content – visible when header is expanded */}
            <Animated.View style={[contentOpacityStyle]} className="p-5">
                {tripCardContent(trip)}
            </Animated.View>

            {/* Compact header – visible when header is collapsed */}
            <Animated.View style={[styles.smallHeaderContent, smallHeaderOpacityStyle, {paddingTop}]}>
                <Text className="text-white text-lg font-bold">Expenses</Text>
                <Text className="text-gray-300 text-sm ml-2">Total: {totalSpent.toLocaleString()}</Text>
            </Animated.View>
        </Animated.View>
    );
};

export default TripDetailsHeader;

const styles = StyleSheet.create({
    smallHeaderContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100, // HEADER_MIN_HEIGHT
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

