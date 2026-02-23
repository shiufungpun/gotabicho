import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {
    BookmarkWithAttractions,
    deleteBookmark,
    getBookmarkById,
    updateAttractionVisited,
    updateBookmarkVisited,
} from '../../src/repositories/bookmarkRepository';
import {useAIExtraction} from '../../src/providers';
import {BookmarkSource} from '../../src/types';

export default function BookmarkDetailScreen() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const bookmarkId = parseInt(id || '0');
    const router = useRouter();
    const navigation = useNavigation();
    const {getExtractionStatus, cancelExtraction} = useAIExtraction();

    const [bookmark, setBookmark] = useState<BookmarkWithAttractions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    useEffect(() => {
        loadBookmark();
    }, [bookmarkId, refreshKey]);

    // Update page title when bookmark is loaded
    useEffect(() => {
        if (bookmark?.title) {
            navigation.setOptions({title: bookmark.title});
        }
    }, [bookmark?.title]);

    // Auto-refresh when extraction completes
    useEffect(() => {
        const interval = setInterval(() => {
            const status = getExtractionStatus(bookmarkId);
            if (status?.status === 'completed') {
                console.log('[BookmarkDetail] Extraction completed, refreshing...');
                loadBookmark();
                clearInterval(interval);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [bookmarkId]);

    const loadBookmark = async () => {
        try {
            const data = await getBookmarkById(bookmarkId);
            setBookmark(data);
        } catch (error) {
            console.error('[BookmarkDetail] Error loading bookmark:', error);
            Alert.alert('Error', 'Failed to load bookmark');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleVisited = async (attractionId: number, currentVisited: boolean) => {
        try {
            await updateAttractionVisited(attractionId, !currentVisited);
            loadBookmark(); // Reload to update UI
        } catch (error) {
            console.error('[BookmarkDetail] Error updating visited status:', error);
        }
    };

    const handleToggleBookmarkVisited = async () => {
        if (!bookmark) return;
        try {
            await updateBookmarkVisited(bookmark.id, !bookmark.visited);
            setBookmark(prev => prev ? {...prev, visited: !prev.visited} : prev);
        } catch (error) {
            console.error('[BookmarkDetail] Error updating bookmark visited status:', error);
        }
    };

    const handleCancelExtraction = () => {
        Alert.alert(
            'Cancel Extraction',
            'Are you sure you want to cancel the AI extraction for this bookmark?',
            [
                {text: 'No', style: 'cancel'},
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => {
                        cancelExtraction(bookmarkId);
                        setRefreshKey(prev => prev + 1);
                    },
                },
            ]
        );
    };

    const handleDeleteBookmark = () => {
        Alert.alert(
            'Delete Bookmark',
            `Are you sure you want to delete "${bookmark?.title}"? This will also remove all its attractions.`,
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteBookmark(bookmarkId);
                        router.back();
                    },
                },
            ]
        );
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

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'sight':
                return 'eye';
            case 'restaurant':
                return 'restaurant';
            case 'shopping':
                return 'bag';
            case 'play':
                return 'game-controller';
            case 'hotel':
                return 'bed';
            default:
                return 'location';
        }
    };

    const getTypeColor = (type: string) => {
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
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6"/>
                <Text className="mt-4 text-gray-600">Loading bookmark...</Text>
            </View>
        );
    }

    if (!bookmark) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center p-4">
                <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF"/>
                <Text className="mt-4 text-lg font-semibold text-gray-800">Bookmark not found</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4 bg-blue-500 px-6 py-3 rounded-xl">
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const extractionStatus = getExtractionStatus(bookmarkId);
    const isProcessing = extractionStatus?.status === 'processing' || extractionStatus?.status === 'queued';
    const hasAttractions = bookmark.attractions && bookmark.attractions.length > 0;

    // Group attractions by type
    const groupedAttractions = bookmark.attractions.reduce((acc, attraction) => {
        const type = attraction.type;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(attraction);
        return acc;
    }, {} as Record<string, typeof bookmark.attractions>);

    const attractionTypes = ['sight', 'restaurant', 'shopping', 'play', 'hotel'];

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                {/* Bookmark Header Card */}
                <View className="m-4 bg-white rounded-xl shadow-md overflow-hidden">

                    {/* Processing Banner */}
                    {isProcessing && (
                        <View className="mx-4 mb-4 bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <ActivityIndicator size="small" color="#7C3AED"/>
                                    <View className="ml-3 flex-1">
                                        <Text className="text-purple-800 font-semibold">
                                            {extractionStatus?.status === 'queued' ? 'Queued for extraction...' : 'Extracting attractions...'}
                                        </Text>
                                        <Text className="text-purple-600 text-xs mt-1">
                                            AI is analyzing the content
                                        </Text>
                                    </View>
                                </View>
                                {/*<TouchableOpacity*/}
                                {/*    onPress={handleCancelExtraction}*/}
                                {/*    className="bg-purple-200 px-3 py-2 rounded-lg">*/}
                                {/*    <Text className="text-purple-800 text-xs font-semibold">Cancel</Text>*/}
                                {/*</TouchableOpacity>*/}
                            </View>
                        </View>
                    )}

                    {/* Thumbnail */}
                    {bookmark.thumbnail_url ? (
                        <Image
                            source={{uri: bookmark.thumbnail_url}}
                            className="w-full h-48"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-48 bg-gray-200 justify-center items-center">
                            <Ionicons name="image-outline" size={64} color="#9CA3AF"/>
                        </View>
                    )}

                    {/* Content */}
                    <View className="p-4">
                        {/* Source Badge */}
                        {bookmark.source && (
                            <View className="flex-row items-center justify-between mb-3">
                                <View
                                    className={`${getSourceBadgeColor(bookmark.source)} px-3 py-1 rounded-full flex-row items-center`}>
                                    <Ionicons
                                        name={getSourceIcon(bookmark.source) as any}
                                        size={14}
                                        color="white"
                                    />
                                    <Text className="text-white text-xs font-semibold ml-1 capitalize">
                                        {bookmark.source}
                                    </Text>
                                </View>
                                {/* Bookmark visited toggle */}
                                <TouchableOpacity
                                    onPress={handleToggleBookmarkVisited}
                                    className={`flex-row items-center px-3 py-1 rounded-full border-2 ${
                                        bookmark.visited
                                            ? 'bg-green-500 border-green-500'
                                            : 'bg-white border-gray-300'
                                    }`}>
                                    <Ionicons
                                        name={bookmark.visited ? 'checkmark-circle' : 'ellipse-outline'}
                                        size={14}
                                        color={bookmark.visited ? 'white' : '#9CA3AF'}
                                    />
                                    <Text
                                        className={`text-xs font-semibold ml-1 ${bookmark.visited ? 'text-white' : 'text-gray-400'}`}>
                                        {bookmark.visited ? 'Visited' : 'Mark visited'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Title */}
                        <Text className="text-xl font-bold text-gray-800 mb-2" numberOfLines={2}>
                            {bookmark.title}
                        </Text>

                        {/* Description */}
                        {bookmark.description && (
                            <View className="mb-3">
                                <Text
                                    className="text-sm text-gray-600"
                                    numberOfLines={isDescriptionExpanded ? undefined : 3}>
                                    {bookmark.description}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setIsDescriptionExpanded(prev => !prev)}
                                    className="flex-row items-center mt-1">
                                    <Text className="text-xs text-blue-500 font-semibold">
                                        {isDescriptionExpanded ? 'Show less' : 'Show more'}
                                    </Text>
                                    <Ionicons
                                        name={isDescriptionExpanded ? 'chevron-up' : 'chevron-down'}
                                        size={12}
                                        color="#3B82F6"
                                    />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* URL */}
                        {bookmark.url && (
                            <View className="flex-row items-center mt-2">
                                <Ionicons name="link" size={16} color="#9CA3AF"/>
                                <Text className="text-xs text-gray-400 ml-2" numberOfLines={1}>
                                    {bookmark.url}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>


                {/* Error Banner */}
                {extractionStatus?.status === 'failed' && (
                    <View className="mx-4 mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <View className="flex-row items-start">
                            <Ionicons name="alert-circle" size={20} color="#DC2626"/>
                            <View className="ml-3 flex-1">
                                <Text className="text-red-800 font-semibold">
                                    Extraction Failed
                                </Text>
                                <Text className="text-red-600 text-xs mt-1">
                                    {extractionStatus.error || 'An error occurred during extraction'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Attractions Section */}
                <View className="mx-4 mb-4">
                    <Text className="text-lg font-bold text-gray-800 mb-3">
                        🗺️ Attractions
                    </Text>

                    {!hasAttractions && !isProcessing && (
                        <View className="bg-white rounded-xl p-8 items-center">
                            <Ionicons name="map-outline" size={48} color="#D1D5DB"/>
                            <Text className="text-gray-500 text-center mt-3">
                                No attractions extracted yet
                            </Text>
                            {extractionStatus?.status === 'failed' && (
                                <Text className="text-gray-400 text-xs text-center mt-2">
                                    The AI extraction encountered an error
                                </Text>
                            )}
                        </View>
                    )}

                    {hasAttractions && (
                        <View className="space-y-3">
                            {attractionTypes.map(type => {
                                const typeAttractions = groupedAttractions[type];
                                if (!typeAttractions || typeAttractions.length === 0) {
                                    return null;
                                }

                                return (
                                    <View key={type} className="mb-4">
                                        <View className="flex-row items-center mb-2">
                                            <View
                                                className={`${getTypeColor(type)} w-8 h-8 rounded-full items-center justify-center`}>
                                                <Ionicons name={getTypeIcon(type) as any} size={16} color="white"/>
                                            </View>
                                            <Text className="text-base font-bold text-gray-700 ml-2 capitalize">
                                                {type}s ({typeAttractions.length})
                                            </Text>
                                        </View>

                                        {typeAttractions.map((attraction) => (
                                            <View key={attraction.id}
                                                  className="bg-white rounded-xl p-4 mb-2 shadow-sm">
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
                                                                    <View key={tagIndex}
                                                                          className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1">
                                                                        <Text className="text-xs text-gray-600">
                                                                            {tag}
                                                                        </Text>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </View>

                                                    <TouchableOpacity
                                                        onPress={() => handleToggleVisited(attraction.id, attraction.visited || false)}
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
                    )}
                </View>

                {/* Bottom spacing */}
                <View className="h-8"/>
            </ScrollView>
        </View>
    );
}


