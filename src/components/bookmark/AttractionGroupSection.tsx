import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {getTypeIcon} from './AttractionCard';
import {AttractionWithTags} from '../../repositories/bookmarkRepository';

interface AttractionGroupSectionProps {
    attractions: AttractionWithTags[];
    onToggleVisited: (attractionId: number, currentVisited: boolean) => void;
}

const ATTRACTION_TYPES = ['sight', 'restaurant', 'shopping', 'play', 'hotel'] as const;

/** Maps a type hex colour to its NativeWind bg class. */
function getTypeColorClass(type: string): string {
    switch (type) {
        case 'sight':
            return 'bg-blue-500';
        case 'restaurant':
            return 'bg-orange-500';
        case 'shopping':
            return 'bg-purple-500';
        case 'play':
            return 'bg-green-500';
        case 'hotel':
            return 'bg-pink-500';
        default:
            return 'bg-gray-500';
    }
}

/**
 * Renders all attractions grouped by type, with a visited toggle on each row.
 */
export function AttractionGroupSection({attractions, onToggleVisited}: AttractionGroupSectionProps) {
    if (!attractions || attractions.length === 0) {
        return (
            <View className="bg-white rounded-xl p-8 items-center">
                <Ionicons name="map-outline" size={48} color="#D1D5DB"/>
                <Text className="text-gray-500 text-center mt-3">No attractions extracted yet</Text>
            </View>
        );
    }

    const grouped = attractions.reduce<Record<string, AttractionWithTags[]>>((acc, attraction) => {
        const type = attraction.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(attraction);
        return acc;
    }, {});

    return (
        <View className="space-y-3">
            {ATTRACTION_TYPES.map(type => {
                const typeAttractions = grouped[type];
                if (!typeAttractions || typeAttractions.length === 0) return null;

                return (
                    <View key={type} className="mb-4">
                        {/* Type header */}
                        <View className="flex-row items-center mb-2">
                            <View
                                className={`${getTypeColorClass(type)} w-8 h-8 rounded-full items-center justify-center`}>
                                <Ionicons name={getTypeIcon(type) as any} size={16} color="white"/>
                            </View>
                            <Text className="text-base font-bold text-gray-700 ml-2 capitalize">
                                {type}s ({typeAttractions.length})
                            </Text>
                        </View>

                        {/* Attraction rows */}
                        {typeAttractions.map(attraction => (
                            <View key={attraction.id} className="bg-white rounded-xl p-4 mb-2 shadow-sm">
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1">
                                        <Text className="text-base font-bold text-gray-800">
                                            {attraction.title}
                                        </Text>

                                        {attraction.location && (
                                            <View className="flex-row items-center mt-1">
                                                <Ionicons name="location" size={12} color="#6B7280"/>
                                                <Text className="text-xs text-gray-600 ml-1">
                                                    {attraction.location}
                                                </Text>
                                            </View>
                                        )}

                                        {attraction.address && (
                                            <View className="flex-row items-start mt-1">
                                                <Ionicons name="navigate" size={12} color="#6B7280"/>
                                                <Text className="text-xs text-gray-600 ml-1 flex-1">
                                                    {attraction.address}
                                                </Text>
                                            </View>
                                        )}

                                        {attraction.notes && (
                                            <Text className="text-xs text-gray-500 mt-2">
                                                {attraction.notes}
                                            </Text>
                                        )}

                                        {attraction.tags && attraction.tags.length > 0 && (
                                            <View className="flex-row flex-wrap mt-2">
                                                {attraction.tags.map((tag, tagIndex) => (
                                                    <View
                                                        key={tagIndex}
                                                        className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1">
                                                        <Text className="text-xs text-gray-600">{tag}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>

                                    {/* Visited toggle */}
                                    <TouchableOpacity
                                        onPress={() => onToggleVisited(attraction.id, attraction.visited || false)}
                                        className={`ml-3 w-6 h-6 rounded-full border-2 items-center justify-center ${
                                            attraction.visited
                                                ? 'bg-green-500 border-green-500'
                                                : 'bg-white border-gray-300'
                                        }`}>
                                        {attraction.visited && (
                                            <Ionicons name="checkmark" size={16} color="white"/>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                );
            })}
        </View>
    );
}


