import React, {useRef} from 'react';
import {Trip} from "../../types";
import TripCard from "../../containers/TripCard";
import {ThemedText} from "../ThemedText";
import {Animated, TouchableOpacity} from "react-native";
import {HEADER_MAX_HEIGHT} from "../../screens/TripListScreen";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";


const TripList = ({trips}: {
    trips: (Trip & { total_expenses: number; participant_count: number; receipt_count: number })[]
}) => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const renderItem = ({item}: {
        item: Trip & { total_expenses: number; participant_count: number; receipt_count: number }
    }) => {
        return <TripCard trip={item}/>;
    };
    const scrollY = useRef(new Animated.Value(0)).current;

    return (
        <Animated.FlatList
            data={trips}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{
                backgroundColor: "red",
                paddingHorizontal: 16,
                paddingBottom: 80,
                paddingTop: HEADER_MAX_HEIGHT + insets.top + 16
            }}
            scrollEventThrottle={16}
            onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {y: scrollY}}}],
                {useNativeDriver: false}
            )}
            ListEmptyComponent={
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddTrip')}
                >
                    <ThemedText variant="tertiary" className="text-center mt-10">
                        No trips yet. Create one!
                    </ThemedText>
                </TouchableOpacity>
            }
        />
    );
};

export default TripList;
