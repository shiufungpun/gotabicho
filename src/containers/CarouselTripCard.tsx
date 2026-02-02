import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemedCard, ThemedText} from "../components";
import {Trip} from "../types";
import {useTheme} from '../theme';
import BudgetCard from "./BudgetCard";
import {Image} from 'expo-image';
import {LinearGradient} from 'expo-linear-gradient';

interface TripCardProps {
    trip: Trip & { total_expenses: number };
}

const CarouselTripCard: React.FC<TripCardProps> = ({trip}) => {
    const navigation = useNavigation<any>();
    const {colors} = useTheme();

    const budget = trip.total_budget || 0;
    const spent = trip.total_expenses || 0;
    const hasBudget = budget > 0;

    const isOverBudget = hasBudget && spent > budget;

    // Convert card color to rgba for gradient
    const getCardColorRgba = (opacity: number) => {
        const cardColor = colors.card;
        // Handle hex colors
        if (cardColor.startsWith('#')) {
            const hex = cardColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r},${g},${b},${opacity})`;
        }
        // Handle rgb colors
        if (cardColor.startsWith('rgb(')) {
            const rgb = cardColor.match(/\d+/g);
            if (rgb) {
                return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;
            }
        }
        // Fallback
        return `rgba(255,255,255,${opacity})`;
    };

    return (
        <TouchableOpacity
            // onPress={() => navigation.navigate('TripHome', {tripId: trip.id, title: trip.name})}
        >
            <ThemedCard className="p-8 rounded-lg h-full">
                <ThemedText variant={"primary"} textStyle={"subheader"}
                            className={"font-iansui"}>{trip.name}</ThemedText>

                <ThemedText variant="secondary">
                    {trip.start_date} - {trip.end_date}
                </ThemedText>

                {/* 替换：使用 LinearGradient 在图片四周制造类似 CSS inset shadow 的模糊边缘 */}
                <View style={styles.imageWrapper}>
                    <Image
                        source={require('../../assets/views/tokyo.jpg')}
                        style={styles.image}
                        contentFit="fill"
                    />

                    {/* Top gradient (card color -> transparent) */}
                    <LinearGradient
                        colors={[getCardColorRgba(1), getCardColorRgba(0)]}
                        style={[styles.edge, styles.topEdge]}
                        pointerEvents="none"
                    />
                    {/* Bottom gradient (transparent -> card color) */}
                    <LinearGradient
                        colors={[getCardColorRgba(0), getCardColorRgba(1)]}
                        style={[styles.edge, styles.bottomEdge]}
                        pointerEvents="none"
                    />
                    {/* Left gradient (card color -> transparent) */}
                    <LinearGradient
                        colors={[getCardColorRgba(1), getCardColorRgba(0)]}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={[styles.sideEdge, styles.leftEdge]}
                        pointerEvents="none"
                    />
                    {/* Right gradient (transparent -> card color) */}
                    <LinearGradient
                        colors={[getCardColorRgba(0), getCardColorRgba(1)]}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={[styles.sideEdge, styles.rightEdge]}
                        pointerEvents="none"
                    />
                </View>

                <BudgetCard spent={spent} budget={budget} currency={trip.base_currency}/>
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

const styles = StyleSheet.create({
    imageWrapper: {
        width: '100%',
        height: '60%',
        marginVertical: 16,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'transparent',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    edge: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 24,
    },
    topEdge: {
        top: 0,
    },
    bottomEdge: {
        bottom: 0,
    },
    sideEdge: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 24,
    },
    leftEdge: {
        left: 0,
    },
    rightEdge: {
        right: 0,
    },
});
