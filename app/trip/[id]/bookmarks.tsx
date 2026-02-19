import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {ThemedText, ThemedView} from "../../../src/components";
import {BookmarkWithAttractions, getBookmarksByTripId} from '../../../src/repositories/bookmarkRepository';
import {BookmarkSource} from '../../../src/types';

export default function TripBookmarksScreen() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const tripId = parseInt(id || '0');
    const router = useRouter();

    const [bookmarks, setBookmarks] = useState<BookmarkWithAttractions[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBookmarks();
    }, [tripId]);

    const loadBookmarks = async () => {
        try {
            const data = await getBookmarksByTripId(tripId);
            setBookmarks(data);
        } catch (error) {
            console.error('[TripBookmarks] Error loading bookmarks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSourceBadgeColor = (source: string | null) => {
        switch (source) {
            case BookmarkSource.Instagram:
                return 'bg-pink-500';
            case BookmarkSource.Threads:
                return 'bg-black';
            default:
                return 'bg-gray-500';
        }
    };

    const getSourceIcon = (source: string | null) => {
        switch (source) {
            case BookmarkSource.Instagram:
                return 'logo-instagram';
            case BookmarkSource.Threads:
                return 'chatbubble-ellipses';
            default:
                return 'link';
        }
    };

    if (isLoading) {
        return (
            <ThemedView className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6"/>
                <ThemedText className="mt-4">Loading bookmarks...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView className="flex-1">
            <ScrollView className="flex-1">
                {bookmarks.length === 0 ? (
                    <View className="flex-1 justify-center items-center p-8 mt-20">
                        <Ionicons name="bookmarks-outline" size={64} color="#D1D5DB"/>
                        <Text className="text-gray-500 text-center mt-4 text-base">
                            No bookmarks added to this trip yet
                        </Text>
                        <Text className="text-gray-400 text-center mt-2 text-sm">
                            Save bookmarks from Instagram, Threads, or Safari to see them here
                        </Text>
                    </View>
                ) : (
                    <View className="p-4">
                        <Text className="text-lg font-bold text-gray-800 mb-4">
                            🔖 {bookmarks.length} Bookmark{bookmarks.length !== 1 ? 's' : ''}
                        </Text>

                        {bookmarks.map((bookmark) => (
                            <TouchableOpacity
                                key={bookmark.id}
                                onPress={() => router.push(`/bookmark/${bookmark.id}`)}
                                className="bg-white rounded-xl shadow-md overflow-hidden mb-4">

                                {/* Thumbnail */}
                                {bookmark.thumbnail_url ? (
                                    <Image
                                        source={{uri: bookmark.thumbnail_url}}
                                        className="w-full h-40"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="w-full h-40 bg-gray-200 justify-center items-center">
                                        <Ionicons name="image-outline" size={48} color="#9CA3AF"/>
                                    </View>
                                )}

                                {/* Content */}
                                <View className="p-4">
                                    {/* Source Badge */}
                                    {bookmark.source && (
                                        <View className="flex-row items-center mb-2">
                                            <View
                                                className={`${getSourceBadgeColor(bookmark.source)} px-2 py-1 rounded-full flex-row items-center`}>
                                                <Ionicons
                                                    name={getSourceIcon(bookmark.source) as any}
                                                    size={12}
                                                    color="white"
                                                />
                                                <Text className="text-white text-xs font-semibold ml-1 capitalize">
                                                    {bookmark.source}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Title */}
                                    <Text className="text-base font-bold text-gray-800 mb-1" numberOfLines={2}>
                                        {bookmark.title}
                                    </Text>

                                    {/* Description */}
                                    {bookmark.description && (
                                        <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                                            {bookmark.description}
                                        </Text>
                                    )}

                                    {/* Attractions Count */}
                                    {bookmark.attractions && bookmark.attractions.length > 0 && (
                                        <View className="flex-row items-center mt-2">
                                            <Ionicons name="location" size={14} color="#7C3AED"/>
                                            <Text className="text-xs text-purple-600 ml-1 font-semibold">
                                                {bookmark.attractions.length} attraction{bookmark.attractions.length !== 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Chevron */}
                                    <View className="absolute right-4 top-4">
                                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}
