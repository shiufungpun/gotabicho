import React, {useRef} from 'react';
import {Animated, Button, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTrips} from '../hooks/useTrips';
import {Trip} from '../types';

export default function TripListScreen() {
    const {trips} = useTrips();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    const HEADER_MAX_HEIGHT = 120 + insets.top;
    const HEADER_MIN_HEIGHT = 60 + insets.top;
    const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    });

    const fontSize = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [32, 24],
        extrapolate: 'clamp',
    });

    const renderItem = ({item}: { item: Trip & { total_expenses: number } }) => {
        const budget = item.total_budget || 0;
        const spent = item.total_expenses || 0;
        const hasBudget = budget > 0;
        const progress = hasBudget ? Math.min(spent / budget, 1) : 0;
        const isOverBudget = hasBudget && spent > budget;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('TripHome', {tripId: item.id, title: item.name})}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.title}>{item.name}</Text>
                    {hasBudget && (
                        <Text style={[styles.budgetLimit, isOverBudget && styles.overBudget]}>
                            {spent.toLocaleString()} / {budget.toLocaleString()} {item.base_currency}
                        </Text>
                    )}
                </View>
                <Text style={styles.subtitle}>{item.start_date} - {item.end_date}</Text>

                {hasBudget && (
                    <View style={styles.progressContainer}>
                        <View style={[
                            styles.progressBar,
                            {
                                width: `${progress * 100}%`,
                                backgroundColor: isOverBudget ? '#ff4444' : '#4caf50'
                            }
                        ]}/>
                    </View>
                )}
                {!hasBudget && spent > 0 && (
                    <Text style={styles.spentText}>Spent: {spent.toLocaleString()} {item.base_currency}</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.header, {height: headerHeight, paddingTop: insets.top}]}>
                <Animated.Text style={[styles.headerTitle, {fontSize}]}>御旅帳</Animated.Text>
            </Animated.View>
            <Animated.FlatList
                data={trips}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={[styles.list, {paddingTop: HEADER_MAX_HEIGHT + 16}]}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {useNativeDriver: false}
                )}
                ListEmptyComponent={<Text style={styles.empty}>No trips yet. Create one!</Text>}
            />
            <View style={styles.fabContainer}>
                <Button title="New Trip" onPress={() => navigation.navigate('AddTrip')}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f5f5f5'},
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        overflow: 'hidden',
        justifyContent: 'flex-end',
        paddingBottom: 12,
        paddingHorizontal: 16,
        zIndex: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: {width: 0, height: 2},
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    headerTitle: {
        fontFamily: Platform.select({
            android: 'ZenOldMincho_400Regular',
            ios: 'ZenOldMincho-Regular',
        }),
        color: '#333'
    },
    list: {paddingHorizontal: 16, paddingBottom: 80},
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: {width: 0, height: 2}
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {fontSize: 18, fontWeight: 'bold'},
    subtitle: {color: '#666', marginTop: 4},
    budgetLimit: {
        fontSize: 18,
        color: '#666',
        fontWeight: '500'
    },
    overBudget: {
        color: '#ff4444'
    },
    progressContainer: {
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        marginTop: 12,
        overflow: 'hidden'
    },
    progressBar: {
        height: '100%',
        borderRadius: 3
    },
    spentText: {
        fontSize: 18,
        color: '#666',
        marginTop: 8
    },
    empty: {textAlign: 'center', marginTop: 40, color: '#888'},
    fabContainer: {position: 'absolute', bottom: 20, right: 20, left: 20}
});
