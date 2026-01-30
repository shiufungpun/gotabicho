import React, {useRef, useState} from 'react';
import {Animated, Button, Dimensions, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTrips} from '../hooks/useTrips';
import {Trip} from '../types';
import {useTheme} from '../theme';
import {ThemedText, ThemedView} from '../components';
import TripCard from "../containers/TripCard";
import {useSharedValue} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import CarouselTripCard from "../containers/CarouselTripCard";

export default function TripListScreen() {
    const [useCarousel] = useState(true) // Set to false to use FlatList instead
    const {trips} = useTrips();
    const progress = useSharedValue<number>(0);
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;
    const {colors} = useTheme();
    const windowWidth = Dimensions.get('window').width;

    const HEADER_MAX_HEIGHT = 100 + insets.top;
    const HEADER_MIN_HEIGHT = 70 + insets.top;
    const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT + 20;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    });

    const fontSize = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [48, 28],
        extrapolate: 'clamp',
    });

    const subtitleFontSize = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [12, 8],
        extrapolate: 'clamp',
    });

    const renderCarouselItem = ({item}: { item: Trip & { total_expenses: number } }) => {
        return <CarouselTripCard trip={item}/>;
    };

    const renderItem = ({item}: { item: Trip & { total_expenses: number } }) => {
        return <TripCard trip={item}/>;
    };

    return (
        <ThemedView className="flex-1">
            <Animated.View className="absolute top-0 left-0 right-0 overflow-hidden justify-end pb-3 px-4 z-10 border-b"
                           style={[
                               {
                                   height: headerHeight,
                                   paddingTop: insets.top,
                                   backgroundColor: colors.surface,
                                   borderBottomColor: colors.border,
                                   shadowColor: colors.shadow,
                                   elevation: 4,
                                   shadowOpacity: 0.1,
                                   shadowRadius: 4,
                                   shadowOffset: {width: 0, height: 2},
                               }
                           ]}>
                <View className="items-center">
                    <Animated.Text className="font-yuji" style={[
                        {fontSize, color: colors.text}
                    ]}>
                        御旅帳
                    </Animated.Text>
                    <Animated.Text className="" style={[
                        {fontSize: subtitleFontSize, color: colors.text}
                    ]}>
                        G O T A B I C H O
                    </Animated.Text>
                </View>
            </Animated.View>
            {useCarousel ? (
                <View className="flex-1 justify-center " style={{paddingTop: HEADER_MAX_HEIGHT - 20}}>
                    <Carousel
                        loop={false}
                        width={windowWidth}
                        height={0}
                        data={trips}
                        scrollAnimationDuration={300}
                        onProgressChange={(offsetProgress, absoluteProgress) => {
                            progress.value = absoluteProgress;
                        }}
                        mode="parallax"
                        modeConfig={{
                            parallaxScrollingScale: 0.9,
                            parallaxScrollingOffset: 50,
                        }}
                        renderItem={renderCarouselItem}
                    />
                    {trips.length === 0 && (
                        <ThemedText variant="tertiary" className="text-center mt-10">
                            No trips yet. Create one!
                        </ThemedText>
                    )}
                </View>
            ) : (
                <Animated.FlatList
                    data={trips}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingBottom: 80,
                        paddingTop: HEADER_MAX_HEIGHT + 16
                    }}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{nativeEvent: {contentOffset: {y: scrollY}}}],
                        {useNativeDriver: false}
                    )}
                    ListEmptyComponent={
                        <ThemedText variant="tertiary" className="text-center mt-10">
                            No trips yet. Create one!
                        </ThemedText>
                    }
                />
            )}

            <View className="absolute bottom-5 right-5 left-5">
                <Button title="New Trip" onPress={() => navigation.navigate('AddTrip')}/>
            </View>
        </ThemedView>
    );
}
