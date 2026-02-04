import React, {useRef, useState} from 'react';
import {Animated, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TripDetails, useTrips} from '../hooks/useTrips';
import {useTheme} from '../theme';
import {ThemedText, ThemedView} from '../components';
import TripCard from "../containers/TripCard";
import TripCardCarousel from "../components/homepage/TripCardCarousel";
import {Icon, Label, NativeTabs} from 'expo-router/unstable-native-tabs';

export default function TripListScreen() {
    const [useCarousel, setUseCarousel] = useState(false) // Set to false to use FlatList instead
    const {trips, loading} = useTrips();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;
    const {colors} = useTheme();

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


    const renderItem = ({item}: { item: TripDetails }) => {
        return <TripCard trip={item}/>;
    };

    const renderList = () => {
        if (useCarousel) {
            return (
                <TripCardCarousel trips={trips}/>
            );
        } else {
            return (
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
            );
        }
    }

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
                    <Animated.Text className="font-hina" style={[
                        {fontSize, color: colors.text}
                    ]}>
                        御旅帳
                    </Animated.Text>
                    <Animated.Text style={[
                        {fontSize: subtitleFontSize, color: colors.text}
                    ]}>
                        G O T A B I C H O
                    </Animated.Text>
                </View>
            </Animated.View>
            {!loading && renderList()}

            {/* Tab Layout at the bottom */}
            <View className="absolute bottom-0 left-0 right-0" style={{paddingBottom: insets.bottom}}>
                <NativeTabs>
                    <NativeTabs.Trigger name="index">
                        <Label>Home</Label>
                        <Icon sf="house.fill" drawable="custom_android_drawable"/>
                    </NativeTabs.Trigger>
                    <NativeTabs.Trigger name="settings">
                        <Icon sf="gear" drawable="custom_settings_drawable"/>
                        <Label>Settings</Label>
                    </NativeTabs.Trigger>
                </NativeTabs>
            </View>
        </ThemedView>
    );
}
