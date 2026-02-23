import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Trip} from "../../types";

type LinkToTripsSelectionProps = {
    trips: Trip[];
    selectedTripIds: number[];
    onToggleTripSelection: (tripId: number) => void;
}

const LinkToTripsSelection = ({trips, selectedTripIds, onToggleTripSelection}: LinkToTripsSelectionProps) => {
    return (
        <View className="m-4">
            <Text className="text-base font-bold text-gray-800 mb-3">
                Link to Trips (Optional)
            </Text>

            {trips.length === 0 ? (
                <View className="bg-gray-50 p-4 rounded-xl">
                    <Text className="text-gray-500 text-center">
                        No trips available. The bookmark will be saved without trip links.
                    </Text>
                </View>
            ) : (
                <View className="space-y-2">
                    {trips.map(trip => {
                        const isSelected = selectedTripIds.includes(trip.id);
                        return (
                            <TouchableOpacity
                                key={trip.id}
                                onPress={() => onToggleTripSelection(trip.id)}
                                className={`flex-row items-center p-4 rounded-xl border-2 ${
                                    isSelected
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'bg-white border-gray-200'
                                }`}>
                                <View
                                    className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                                        isSelected
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'bg-white border-gray-300'
                                    }`}>
                                    {isSelected && (
                                        <Ionicons name="checkmark" size={16} color="white"/>
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text
                                        className={`font-semibold ${
                                            isSelected ? 'text-blue-700' : 'text-gray-800'
                                        }`}>
                                        {trip.name}
                                    </Text>
                                    {trip.start_date && trip.end_date && (
                                        <Text className="text-xs text-gray-500 mt-1">
                                            {trip.start_date} - {trip.end_date}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {selectedTripIds.length > 0 && (
                <Text className="text-sm text-gray-600 mt-3">
                    {selectedTripIds.length} trip(s) selected
                </Text>
            )}
        </View>
    );
};

export default LinkToTripsSelection;
