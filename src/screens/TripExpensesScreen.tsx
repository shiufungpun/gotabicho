import React, {useMemo} from 'react';
import {SectionList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import {PieChart} from 'react-native-gifted-charts';
import {Ionicons} from '@expo/vector-icons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useTripDetails} from '../hooks/useTripDetails';
import {ReceiptWithDetails} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TripExpenses'>;

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 100; // Condensed header height

export default function TripExpensesScreen({route, navigation}: Props) {
    const {tripId} = route.params;
    const {trip, receipts, participants} = useTripDetails(tripId);
    const insets = useSafeAreaInsets();
    const scrollY = useSharedValue(0);

    const myId = useMemo(() => {
        // Find "You" - assuming name is 'You' as per requirements
        return participants.find(p => p.name === 'You')?.id;
    }, [participants]);


    // --- Data Processing for Overview ---

    // Sort and Group Receipts
    const receiptSections = useMemo(() => {
        if (!receipts) return [];

        // 1. Sort by date (descending)
        const sorted = [...receipts].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // 2. Group by date
        const grouped: { title: string; data: ReceiptWithDetails[] }[] = [];

        sorted.forEach(receipt => {
            const dateObj = new Date(receipt.date);
            // Verify valid date
            if (isNaN(dateObj.getTime())) return;

            const dateStr = dateObj.toISOString().split('T')[0]; // "YYYY-MM-DD"

            const lastSection = grouped[grouped.length - 1];
            if (lastSection && lastSection.title === dateStr) {
                lastSection.data.push(receipt);
            } else {
                grouped.push({title: dateStr, data: [receipt]});
            }
        });

        return grouped;
    }, [receipts]);

    const {totalSpent, budget, categoryPieData} = useMemo(() => {
        let spent = 0;
        const categoryMap: { [key: string]: number } = {};

        receipts.forEach(r => {
            spent += r.total_amount;
            r.items.forEach(item => {
                const cat = item.category || 'Other';
                categoryMap[cat] = (categoryMap[cat] || 0) + item.amount;
            });
        });

        // Colors for chart
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
        let colorIndex = 0;

        const pieData = Object.keys(categoryMap).map(key => {
            const val = categoryMap[key];
            const color = colors[colorIndex % colors.length];
            colorIndex++;
            return {value: val, color: color, text: key};
        });

        return {
            totalSpent: spent,
            budget: trip?.total_budget || 0,
            categoryPieData: pieData
        };
    }, [receipts, trip]);

    const progress = budget > 0 ? Math.min(totalSpent / budget, 1) : 0;

    // --- Animations ---

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

    // --- Render Items ---

    const renderSectionHeader = ({section}: any) => {
        const title = section.title;
        const dateObj = new Date(title);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('default', {month: 'short'});
        const year = dateObj.getFullYear();
        const todayYear = new Date().getFullYear();

        const displayDate = year === todayYear ? `${month} ${day}` : `${month} ${day}, ${year}`;

        return (
            <View className="bg-gray-50 flex-row items-center pt-2 pb-2 pl-4 z-10">
                {/* Timeline Line Placeholder to maintain continuity/alignment */}
                <View className="w-[40px] items-center mr-2">
                    {/* Optional: Add a small dot or line if we want timeline to go through header */}
                </View>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-800 font-bold text-xs">{displayDate}</Text>
                </View>
            </View>
        );
    };

    const renderReceiptItem = ({item, index, section}: any) => {
        const receiptItem = item as ReceiptWithDetails;
        // Calculate My Share
        let myShare = 0;
        if (myId) {
            receiptItem.items.forEach(rItem => {
                const share = rItem.shares.find(s => s.participant_id === myId);
                if (share) {
                    myShare += share.share_amount;
                }
            });
        }

        const isSplit = myShare > 0 && Math.abs(myShare - receiptItem.total_amount) > 0.01;
        const displayAmount = isSplit
            ? `${receiptItem.currency} ${myShare.toLocaleString()} (${receiptItem.total_amount.toLocaleString()})`
            : `${receiptItem.currency} ${receiptItem.total_amount.toLocaleString()}`;

        const isLastItem = index === section.data.length - 1;

        return (
            <View className="flex-row mx-4 mb-0">
                {/* Visual Timeline (Left) */}
                <View className="w-[40px] items-center mr-2">
                    {/* Vertical Line */}
                    <View
                        className="absolute w-[2px] bg-gray-300 left-1/2 -ml-[1px]"
                        style={{
                            top: 0,
                            bottom: isLastItem ? '50%' : -10 // Extend to next item, unless last
                        }}
                    />
                    {/* Node/Dot */}
                    <View className="w-3 h-3 bg-blue-500 rounded-full mt-8 border-2 border-white z-10"/>
                </View>

                {/* Card (Right) */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('ReceiptDetail', {receiptId: receiptItem.id})}
                    className="flex-1 bg-white p-4 mb-3 rounded-xl shadow-sm flex-row justify-between items-center"
                >
                    <View className="flex-1">
                        <Text className="text-gray-900 font-bold text-base">{receiptItem.store_name || 'Expense'}</Text>
                        <View className="flex-row items-center mt-1">
                            {/* Category Label */}
                            {receiptItem.items.length > 0 ? (
                                <Text className="text-gray-500 text-xs mr-2 px-1.5 py-0.5 bg-gray-100 rounded">
                                    {receiptItem.items[0].category}
                                </Text>
                            ) : (
                                <Text
                                    className="text-gray-500 text-xs mr-2 px-1.5 py-0.5 bg-gray-100 rounded">General</Text>
                            )}
                            {/* Time (optional detail? or kept date?) - Date is in header now, maybe show TIME here if available, else blank */}
                        </View>
                    </View>
                    <View>
                        <Text className="text-gray-900 font-bold text-right">{displayAmount}</Text>
                        {isSplit && <Text className="text-gray-400 text-[10px] text-right">Split</Text>}
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Animated Header */}
            <Animated.View
                style={[
                    styles.header,
                    headerAnimatedStyle,
                    {paddingTop: insets.top}
                ]}
            >
                {/* Expanded Content (Charts, etc) */}
                <Animated.View style={[styles.headerContent, contentOpacityStyle]}>
                    <Text className="text-white text-xl font-bold mb-4 text-center">Trip Overview</Text>
                    <View className="flex-row justify-around items-center w-full px-4">
                        {/* Pie Chart */}
                        <View className="items-center justify-center" style={{width: 140, height: 140}}>
                            {categoryPieData.length > 0 ? (
                                <PieChart
                                    data={categoryPieData}
                                    donut
                                    radius={70}
                                    innerRadius={50}
                                    backgroundColor="transparent"
                                    centerLabelComponent={() => <View/>}
                                />
                            ) : (
                                <View
                                    className="h-[120px] w-[120px] rounded-full border-4 border-gray-300 justify-center items-center">
                                    <Text className="text-gray-300 text-xs">No Data</Text>
                                </View>
                            )}
                        </View>

                        {/* Stats & Progress */}
                        <View className="flex-1 ml-6">
                            <Text className="text-white text-sm mb-1">Spent / Budget</Text>
                            <Text className="text-white font-bold text-2xl">
                                {Math.round(progress * 100)}%
                            </Text>
                            <View className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                                <View
                                    style={{width: `${Math.min(progress * 100, 100)}%`}}
                                    className="h-full bg-blue-400"
                                />
                            </View>
                            <Text className="text-gray-300 text-xs mt-2">
                                Total: {trip?.base_currency} {totalSpent.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Collapsed Header Content (Simple Title) */}
                <Animated.View style={[styles.smallHeaderContent, smallHeaderOpacityStyle, {paddingTop: insets.top}]}>
                    <Text className="text-white text-lg font-bold">Expenses</Text>
                    <Text className="text-gray-300 text-sm ml-2">Total: {totalSpent.toLocaleString()}</Text>
                </Animated.View>
            </Animated.View>

            {/* List */}
            <AnimatedSectionList
                sections={receiptSections}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={renderReceiptItem}
                renderSectionHeader={renderSectionHeader}
                stickySectionHeadersEnabled={true}
                contentContainerStyle={{
                    paddingTop: HEADER_MAX_HEIGHT + 20,
                    paddingBottom: 100
                }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                ListEmptyComponent={
                    <View className="items-center mt-10 p-4">
                        <Text className="text-gray-400">No expenses yet. Tap + to add one.</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity
                className="absolute bottom-8 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                onPress={() => navigation.navigate('AddReceipt', {tripId})}
            >
                <Ionicons name="add" size={30} color="white"/>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E293B', // Slate 800
        zIndex: 10,
        overflow: 'hidden',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 10,
    },
    smallHeaderContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_MIN_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

