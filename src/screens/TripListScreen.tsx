import React, {useRef} from 'react';
import {Animated, Button, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTrips} from '../hooks/useTrips';
import {Trip} from '../types';
import {useTheme} from '../theme';
import {ThemedText, ThemedView} from '../components';
import TripCard from "../containers/TripCard";
import ActiveTripCard from "../containers/ActiveTripCard";

export default function TripListScreen() {
    const {trips} = useTrips();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;
    const {colors} = useTheme();

    const HEADER_MAX_HEIGHT = 110 + insets.top;
    const HEADER_MIN_HEIGHT = 80 + insets.top;
    const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    });

    const fontSize = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [48, 24],
        extrapolate: 'clamp',
    });

    const subtitleFontSize = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [12, 6],
        extrapolate: 'clamp',
    });

    const renderItem = ({item}: { item: Trip & { total_expenses: number } }) => {
        return <TripCard trip={item}/>;
    };

    return (
        <ThemedView style={styles.container}>
            <Animated.View style={[
                styles.header,
                {
                    height: headerHeight,
                    paddingTop: insets.top,
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.border,
                    shadowColor: colors.shadow,
                }
            ]}>
                <View className={"items-center"}>
                    <Animated.Text className={"font-yuji"} style={[
                        {fontSize, color: colors.text}
                    ]}>
                        御旅帳
                    </Animated.Text>
                    <Animated.Text className={""} style={[
                        {fontSize: subtitleFontSize, color: colors.text}
                    ]}>
                        G O T A B I C H O
                    </Animated.Text>
                </View>
            </Animated.View>
            <Animated.FlatList
                ListHeaderComponent={<ActiveTripCard trip={undefined}/>}
                data={trips}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={[styles.list, {paddingTop: HEADER_MAX_HEIGHT + 16}]}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {useNativeDriver: false}
                )}
                ListEmptyComponent={
                    <ThemedText variant="tertiary" style={styles.empty}>
                        No trips yet. Create one!
                    </ThemedText>
                }
            />
            <View style={styles.fabContainer}>
                <Button title="New Trip" onPress={() => navigation.navigate('AddTrip')}/>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        paddingBottom: 12,
        paddingHorizontal: 16,
        zIndex: 1,
        elevation: 4,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: {width: 0, height: 2},
        borderBottomWidth: 1,
    },
    list: {paddingHorizontal: 16, paddingBottom: 80},
    card: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    budgetLimit: {
        fontSize: 18,
        fontWeight: '500'
    },
    progressContainer: {
        height: 6,
        borderRadius: 3,
        marginTop: 12,
        overflow: 'hidden'
    },
    progressBar: {
        height: '100%',
        borderRadius: 3
    },
    empty: {textAlign: 'center', marginTop: 40},
    fabContainer: {position: 'absolute', bottom: 20, right: 20, left: 20}
});
