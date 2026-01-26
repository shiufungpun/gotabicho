import React, {useRef} from 'react';
import {Animated, Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTrips} from '../hooks/useTrips';
import {Trip} from '../types';

export default function TripListScreen() {
    const {trips, loading} = useTrips();
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

    const renderItem = ({item}: { item: Trip }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TripHome', {tripId: item.id, title: item.name})}
        >
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>{item.start_date} - {item.end_date}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.header, {height: headerHeight, paddingTop: insets.top}]}>
                <Animated.Text style={[styles.headerTitle, {fontSize}]}>My Trips</Animated.Text>
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
        fontWeight: 'bold',
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
    title: {fontSize: 18, fontWeight: 'bold'},
    subtitle: {color: '#666', marginTop: 4},
    empty: {textAlign: 'center', marginTop: 40, color: '#888'},
    fabContainer: {position: 'absolute', bottom: 20, right: 20, left: 20}
});
