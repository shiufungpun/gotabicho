import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View,} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {ThemedText, ThemedView} from '../src/components';
import {getAllTrips} from '../src/repositories/tripRepository';
import {BookmarkSource, Trip} from '../src/types';
import {generateText} from 'ai';
import {apple} from '@react-native-ai/apple';
import {bookmarkPrompt} from '../src/prompts/bookmark';

export default function AddBookmarkScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        title: string;
        description: string;
        url: string;
        source: string;
        imageUrl: string;
        content: string;
    }>();

    const [trips, setTrips] = useState<Trip[]>([]);
    const [selectedTripIds, setSelectedTripIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [extractionError, setExtractionError] = useState('');

    // Log extracted data on mount
    useEffect(() => {
        console.log('[Bookmark] Extracted metadata:', {
            title: params.title,
            description: params.description,
            url: params.url,
            source: params.source,
            imageUrl: params.imageUrl,
        });

        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const allTrips = await getAllTrips();
            setTrips(allTrips);
        } catch (error) {
            console.error('[AddBookmark] Error loading trips:', error);
            Alert.alert('Error', 'Failed to load trips');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTripSelection = (tripId: number) => {
        setSelectedTripIds(prev => {
            if (prev.includes(tripId)) {
                return prev.filter(id => id !== tripId);
            } else {
                return [...prev, tripId];
            }
        });
    };

    const extractDataWithAI = async () => {
        console.log('[Bookmark] Starting AI extraction...');
        setIsExtracting(true);
        setExtractionError('');
        setExtractedData(null);

        try {
            // Use description as the article content to extract from
            const articleContent = params.content || params.description || params.title;

            if (!articleContent) {
                setExtractionError('No content available to extract');
                return;
            }

            console.log('[Bookmark] Extracting from content:', articleContent);

            // Generate text using Apple Intelligence
            const result = await generateText({
                prompt: `${bookmarkPrompt}\n${articleContent}`,
                model: apple(),
            });

            console.log('[Bookmark] AI Response:', result.text);

            // Try to parse the JSON response
            try {
                const parsed = JSON.parse(result.text);
                setExtractedData(parsed);
                console.log('[Bookmark] Parsed data:', parsed);
            } catch (parseError) {
                console.error('[Bookmark] Failed to parse JSON:', parseError);
                setExtractionError(`Failed to parse response: ${result.text}`);
            }

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setExtractionError(errorMsg);
            console.error('[Bookmark] AI Extraction Error:', err);
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSave = () => {
        console.log('[Bookmark] Save button pressed');
        console.log('[Bookmark] Selected trip IDs:', selectedTripIds);

        if (selectedTripIds.length === 0) {
            console.log('[Bookmark] No trips selected - saving standalone bookmark');
        } else {
            console.log('[Bookmark] Saving bookmark linked to trips:', selectedTripIds);
        }

        // TODO: Implement actual save to database
        Alert.alert(
            'Bookmark Preview',
            'This is a preview. Check console for logged data. Database save not implemented yet.',
            [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]
        );
    };

    const getSourceBadgeColor = (source: string) => {
        switch (source) {
            case BookmarkSource.Instagram:
                return 'bg-pink-500';
            case BookmarkSource.Threads:
                return 'bg-black';
            default:
                return 'bg-gray-500';
        }
    };

    const getSourceIcon = (source: string) => {
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
                <ThemedText className="mt-4">Loading...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView className="flex-1">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color="#374151"/>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800">Add Bookmark</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-blue-600 font-semibold text-base">Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Preview Card */}
                <View className="m-4 bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Thumbnail */}
                    {params.imageUrl ? (
                        <Image
                            source={{uri: params.imageUrl}}
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
                        <View className="flex-row items-center mb-3">
                            <View
                                className={`${getSourceBadgeColor(params.source)} px-3 py-1 rounded-full flex-row items-center`}>
                                <Ionicons
                                    name={getSourceIcon(params.source) as any}
                                    size={14}
                                    color="white"
                                />
                                <Text className="text-white text-xs font-semibold ml-1 capitalize">
                                    {params.source}
                                </Text>
                            </View>
                        </View>

                        {/* Title */}
                        <Text className="text-xl font-bold text-gray-800 mb-2">
                            {params.title}
                        </Text>

                        {/* Description */}
                        {params.description && (
                            <Text className="text-sm text-gray-600 mb-3" numberOfLines={3}>
                                {params.description}
                            </Text>
                        )}

                        {/* URL */}
                        <View className="flex-row items-center mt-2">
                            <Ionicons name="link" size={16} color="#9CA3AF"/>
                            <Text className="text-xs text-gray-400 ml-2" numberOfLines={1}>
                                {params.url}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* AI Extraction Section */}
                <View className="m-4">
                    <Text className="text-base font-bold text-gray-800 mb-3">
                        🤖 AI Data Extraction Test
                    </Text>

                    <TouchableOpacity
                        onPress={extractDataWithAI}
                        disabled={isExtracting}
                        className={`bg-purple-600 p-4 rounded-xl flex-row items-center justify-center ${
                            isExtracting ? 'opacity-50' : ''
                        }`}>
                        {isExtracting ? (
                            <>
                                <ActivityIndicator color="white" size="small"/>
                                <Text className="text-white font-semibold ml-2">Extracting...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="sparkles" size={20} color="white"/>
                                <Text className="text-white font-semibold ml-2">
                                    Extract Data with AI
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Extraction Error */}
                    {extractionError && (
                        <View className="mt-3 bg-red-50 p-4 rounded-xl border border-red-200">
                            <View className="flex-row items-start">
                                <Ionicons name="alert-circle" size={20} color="#DC2626"/>
                                <View className="flex-1 ml-2">
                                    <Text className="text-red-600 font-semibold mb-1">
                                        Extraction Failed
                                    </Text>
                                    <Text className="text-red-500 text-sm">
                                        {extractionError}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Extracted Data Display */}
                    {extractedData && (
                        <View className="mt-3 bg-green-50 p-4 rounded-xl border border-green-200">
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="checkmark-circle" size={20} color="#16A34A"/>
                                <Text className="text-green-700 font-semibold ml-2">
                                    Extraction Successful ✨
                                </Text>
                            </View>

                            {extractedData.viewpoints && extractedData.viewpoints.length > 0 ? (
                                extractedData.viewpoints.map((viewpoint: any, index: number) => (
                                    <View key={index} className="mb-3 bg-white p-3 rounded-lg">
                                        <View className="flex-row items-center mb-2">
                                            <Ionicons name="location" size={16} color="#7C3AED"/>
                                            <Text className="text-purple-700 font-bold ml-1">
                                                {viewpoint.location}
                                            </Text>
                                        </View>

                                        {viewpoint.keyPoints && viewpoint.keyPoints.length > 0 && (
                                            <View className="ml-5">
                                                <Text className="text-gray-600 text-xs font-semibold mb-1">
                                                    Key Points:
                                                </Text>
                                                {viewpoint.keyPoints.map((point: string, pIndex: number) => (
                                                    <View key={pIndex} className="flex-row mb-1">
                                                        <Text className="text-gray-500 text-xs mr-2">•</Text>
                                                        <Text className="text-gray-700 text-xs flex-1">
                                                            {point}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text className="text-gray-600 text-sm">
                                    No viewpoints extracted
                                </Text>
                            )}

                            {/* Raw JSON for debugging */}
                            <View className="mt-3 pt-3 border-t border-green-200">
                                <Text className="text-green-700 text-xs font-semibold mb-2">
                                    Raw JSON:
                                </Text>
                                <ScrollView
                                    horizontal
                                    className="bg-gray-800 p-2 rounded"
                                    showsHorizontalScrollIndicator={false}
                                >
                                    <Text className="text-green-400 text-xs font-mono">
                                        {JSON.stringify(extractedData, null, 2)}
                                    </Text>
                                </ScrollView>
                            </View>
                        </View>
                    )}
                </View>

                {/* Trip Selection */}
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
                                        onPress={() => toggleTripSelection(trip.id)}
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

                {/* Bottom spacing */}
                <View className="h-8"/>
            </ScrollView>
        </ThemedView>
    );
}

