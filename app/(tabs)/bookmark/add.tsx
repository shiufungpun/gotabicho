import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, AppState, BackHandler, Platform, ScrollView, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';

import {useShareIntentHandler} from "../../../src/hooks/useShareIntent";
import {useAIExtraction} from "../../../src/providers";
import {Trip} from "../../../src/types";
import {getAllTrips} from "../../../src/repositories/tripRepository";
import {createBookmark, linkBookmarkToTrips} from "../../../src/repositories/bookmarkRepository";
import {notifyBookmarkChange} from "../../../src/services/dataEventEmitter";
import {BookmarkPreviewCard, ThemedText, ThemedView} from "../../../src/components";
import ConfirmGlassButtonBar from "../../../src/components/ui/ConfirmGlassButtonBar";

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
            router.back();
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

            // Notify bookmark listing to refresh
            notifyBookmarkChange();

            // Clear share data first
            clearShareData();

            // Replace the add sheet with the detail page so it's fully dismissed
            console.log('[Bookmark] Navigating to bookmark detail:', bookmarkId);
            router.replace(`/(tabs)/bookmark/${bookmarkId}`);
        } catch (error) {
            console.error('[Bookmark] Error saving bookmark:', error);
            Alert.alert('Error', 'Failed to save bookmark. Please try again.');
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
                <View className="mx-5">
                    <BookmarkPreviewCard
                        title={params.title}
                        description={params.description}
                        url={params.url}
                        source={params.source}
                        thumbnailUrl={params.imageUrl}
                        showTitle={false}
                        defaultExpanded={true}
                    />
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
