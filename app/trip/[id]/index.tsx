import React, {useMemo} from 'react';
import {SectionList, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import {useLocalSearchParams} from 'expo-router';
import {useTripDetails} from '../../../src/hooks/useTripDetails';
import {ReceiptWithDetails} from '../../../src/types';
import {useTheme} from '../../../src/theme';
import {ThemedText, ThemedView} from '../../../src/components';
import {ReceiptItem, ReceiptSectionHeader, TripDetailsHeader} from '../../../src/containers/trips';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const HEADER_MAX_HEIGHT = 250;
const HEADER_MIN_HEIGHT = 100;

export default function TripDetailsScreen() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const tripId = parseInt(id || '0');
    const {trip, receipts, participants} = useTripDetails(tripId);
    const insets = useSafeAreaInsets();
    const scrollY = useSharedValue(0);
    const {colors} = useTheme();

    const myId = useMemo(() => {
        return participants.find(p => p.name === 'You')?.id;
    }, [participants]);

    const receiptSections = useMemo(() => {
        if (!receipts) return [];

        const sorted = [...receipts].sort((a, b) =>
            new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
        );

        const grouped: { title: string; data: ReceiptWithDetails[] }[] = [];

        sorted.forEach(receipt => {
            if (!receipt.date) return;
            const dateObj = new Date(receipt.date);
            if (isNaN(dateObj.getTime())) return;

            const dateStr = dateObj.toISOString().split('T')[0];

            const lastSection = grouped[grouped.length - 1];
            if (lastSection && lastSection.title === dateStr) {
                lastSection.data.push(receipt);
            } else {
                grouped.push({title: dateStr, data: [receipt]});
            }
        });

        return grouped;
    }, [receipts]);

    const {totalSpent} = useMemo(() => {
        let spent = 0;
        const categoryMap: { [key: string]: number } = {};

        receipts.forEach(r => {
            spent += r.total_amount;
            r.items.forEach(item => {
                const cat = item.category || 'Other';
                categoryMap[cat] = (categoryMap[cat] || 0) + item.amount;
            });
        });

        return {totalSpent: spent};
    }, [receipts]);

    const scrollHandler = useAnimatedScrollHandler(event => {
        scrollY.value = event.contentOffset.y;
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        const height = interpolate(
            scrollY.value,
            [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
            [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
            Extrapolation.CLAMP
        );
        return {height};
    });

    const contentOpacityStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) / 2],
            [1, 0],
            Extrapolation.CLAMP
        );
        return {opacity};
    });

    const smallHeaderOpacityStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT) / 1.5, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
            [0, 1],
            Extrapolation.CLAMP
        );
        return {opacity};
    });

    if (!trip) {
        return (
            <ThemedView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ThemedText variant="warning">Trip not found</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{flex: 1}}>
            <TripDetailsHeader
                trip={trip}
                totalSpent={totalSpent}
                headerAnimatedStyle={headerAnimatedStyle}
                contentOpacityStyle={contentOpacityStyle}
                smallHeaderOpacityStyle={smallHeaderOpacityStyle}
                cardBackgroundColor={colors.card}
                paddingTop={insets.top}
            />

            <AnimatedSectionList
                sections={receiptSections}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({item}: any) => (
                    <ReceiptItem receipt={item as ReceiptWithDetails} myId={myId}/>
                )}
                renderSectionHeader={({section}: any) => (
                    <ReceiptSectionHeader title={section.title}/>
                )}
                stickySectionHeadersEnabled={true}
                contentContainerStyle={{paddingBottom: 100}}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                ListEmptyComponent={
                    <View className="items-center mt-10 p-4">
                        <Text className="text-gray-400">No expenses yet. Tap + to add one.</Text>
                    </View>
                }
            />
        </ThemedView>
    );
}

