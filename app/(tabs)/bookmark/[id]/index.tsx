import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {
    BookmarkWithAttractions,
    deleteBookmark,
    getBookmarkById,
    updateAttractionVisited,
    updateBookmarkVisited,
} from '../../../../src/repositories/bookmarkRepository';
import {useAIExtraction} from '../../../../src/providers';
import {AttractionGroupSection, BookmarkPreviewCard, ExtractionStatusBanner,} from '../../../../src/components';

export default function BookmarkDetailScreen() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const bookmarkId = parseInt(id || '0');
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {getExtractionStatus} = useAIExtraction();

    const [bookmark, setBookmark] = useState<BookmarkWithAttractions | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBookmark();
    }, [bookmarkId]);

    // Auto-refresh while extraction is in progress
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
            loadBookmark();
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
            ],
        );
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

    return (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Extraction status banner (processing / error) */}
            {extractionStatus && extractionStatus.status !== 'completed' && (
                <View className="mt-4">
                    <ExtractionStatusBanner
                        status={extractionStatus.status}
                        error={extractionStatus.error}
                    />
                </View>
            )}

            {/* Bookmark preview card */}
            <View className="mx-4 mb-4 mt-4">
                <BookmarkPreviewCard
                    title={bookmark.title}
                    description={bookmark.description}
                    url={bookmark.url}
                    source={bookmark.source}
                    thumbnailUrl={bookmark.thumbnail_url}
                    visited={bookmark.visited as unknown as boolean}
                    onToggleVisited={handleToggleBookmarkVisited}
                />
            </View>

            {/* Attractions section */}
            <View className="mx-4 mb-4">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-gray-800">🗺️ Attractions</Text>
                    <TouchableOpacity onPress={handleDeleteBookmark} className="p-2">
                        <Ionicons name="trash-outline" size={20} color="#EF4444"/>
                    </TouchableOpacity>
                </View>

                <AttractionGroupSection
                    attractions={bookmark.attractions}
                    onToggleVisited={handleToggleVisited}
                />
            </View>

            {/* Bottom spacing */}
            <View style={{height: Math.max(insets.bottom, 16) + 16}}/>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
});
