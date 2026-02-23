import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, AppState, BackHandler, Image, Platform, ScrollView, Text, View,} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';

import {useShareIntentHandler} from "../../src/hooks/useShareIntent";
import {useAIExtraction} from "../../src/providers";
import {BookmarkSource, Trip} from "../../src/types";
import {getAllTrips} from "../../src/repositories/tripRepository";
import {createBookmark, linkBookmarkToTrips} from "../../src/repositories/bookmarkRepository";
import {ThemedText, ThemedView} from "../../src/components";
import ConfirmGlassButtonBar from "../../src/components/ui/ConfirmGlassButtonBar";

export default function AddBookmarkScreen() {
    const router = useRouter();
    const {clearShareData} = useShareIntentHandler();
    const {queueExtraction} = useAIExtraction();
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

    // Clear share data when app goes to background or component unmounts
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                console.log('[Bookmark] App going to background, clearing share data');
                clearShareData();
            }
        });

        return () => {
            subscription.remove();
            console.log('[Bookmark] Component unmounting, clearing share data');
            clearShareData();
        };
    }, [clearShareData]);

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

    const handleCancel = () => {
        console.log('[Bookmark] Cancel button pressed, clearing share data');
        clearShareData();

        // Close the app to return to the sharing app (Instagram/Safari)
        if (Platform.OS === 'android') {
            // On Android, exit the app to return to the sharing app
            BackHandler.exitApp();
        } else {
            // On iOS, we can't programmatically close the app due to App Store guidelines
            // Instead, navigate to home screen and the user can manually switch back
            // The share extension will automatically dismiss when they switch apps
            router.replace('/');
        }
    };

    const handleSave = async () => {
        console.log('[Bookmark] Save button pressed');
        console.log('[Bookmark] Selected trip IDs:', selectedTripIds);

        try {
            // Create bookmark in database
            const bookmarkId = await createBookmark({
                title: params.title || 'Untitled Bookmark',
                description: params.description || null,
                url: params.url || null,
                thumbnail_url: params.imageUrl || null,
                source: params.source || null,
                visited: false,
            });

            console.log('[Bookmark] Created bookmark with ID:', bookmarkId);

            // Link to selected trips
            if (selectedTripIds.length > 0) {
                await linkBookmarkToTrips(bookmarkId, selectedTripIds);
                console.log('[Bookmark] Linked to trips:', selectedTripIds);
            }

            // Queue AI extraction in background
            const contentForExtraction = params.content || params.description || params.title || '';
            await queueExtraction(bookmarkId, contentForExtraction);
            console.log('[Bookmark] Queued AI extraction');

            // Clear share data first
            clearShareData();

            // Platform-specific navigation
            if (Platform.OS === 'ios') {
                // On iOS, dismiss the modal and navigate to bookmark detail page
                console.log('[Bookmark] iOS: Dismissing modal and navigating to bookmark detail');
                // Dismiss the current modal to get back to main screen
                router.dismiss();
                // Then navigate to the bookmark detail page
                setTimeout(() => {
                    router.push(`/bookmark/${bookmarkId}`);
                }, 100);
            } else {
                // On Android, exit to return to share app
                console.log('[Bookmark] Android: Exiting app to return to share source');
                BackHandler.exitApp();
            }
        } catch (error) {
            console.error('[Bookmark] Error saving bookmark:', error);
            Alert.alert('Error', 'Failed to save bookmark. Please try again.');
        }
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
            <ConfirmGlassButtonBar
                onCancel={handleCancel}
                onConfirm={handleSave}
                disabled={false}
            />
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


                {/* Trip Selection */}
                {/*<LinkToTripsSelection */}
                {/*    trips={trips}*/}
                {/*    selectedTripIds={selectedTripIds}*/}
                {/*    onToggleTripSelection={toggleTripSelection}*/}
                {/*/>*/}

                {/* Bottom spacing */}
                <View className="h-8"/>
            </ScrollView>
        </ThemedView>
    );
}
