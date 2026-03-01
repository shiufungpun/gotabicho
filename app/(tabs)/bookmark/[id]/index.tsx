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
import {AttractionGroupSection, BookmarkHeroHeader, ExtractionStatusBanner,} from '../../../../src/components';
import {dataChangeEmitter, notifyBookmarkChange} from '../../../../src/services/dataEventEmitter';

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

    // Re-load whenever a data change is emitted (e.g. AI extraction completed)
    useEffect(() => {
        const unsubscribe = dataChangeEmitter.subscribe(() => {
            loadBookmark();
        });
        return () => unsubscribe();
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
            notifyBookmarkChange();
        } catch (error) {
            console.error('[BookmarkDetail] Error updating visited status:', error);
        }
    };

    const handleToggleBookmarkVisited = async () => {
        if (!bookmark) return;
        try {
            await updateBookmarkVisited(bookmark.id, !bookmark.visited);
            notifyBookmarkChange();
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
                        notifyBookmarkChange();
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
        <View className="flex-1 bg-gray-50">
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
                        contentInsetAdjustmentBehavior="never">

                {/* ── Hero header (full-bleed thumbnail) ─────────────────── */}
                <BookmarkHeroHeader
                    thumbnailUrl={bookmark.thumbnail_url}
                    source={bookmark.source}
                    visited={bookmark.visited as unknown as boolean}
                    onToggleVisited={handleToggleBookmarkVisited}
                    onBack={() => router.back()}
                    onDelete={handleDeleteBookmark}
                    topInset={insets.top}
                />

                {/* ── Extraction status banner (below hero) ──────────────── */}
                {extractionStatus && extractionStatus.status !== 'completed' && (
                    <View className="mt-3">
                        <ExtractionStatusBanner
                            status={extractionStatus.status}
                            error={extractionStatus.error}
                        />
                    </View>
                )}

                {/* ── Bookmark content ────────────────────────────────────── */}
                <View className="px-4 pt-4 pb-2 bg-white ">
                    {/* Title */}
                    {bookmark.title && (
                        <Text className="text-xl font-bold text-gray-800 mb-2" numberOfLines={3}>
                            {bookmark.title}
                        </Text>
                    )}

                    {/* Description */}
                    {bookmark.description && (
                        <ExpandableDescription description={bookmark.description}/>
                    )}

                    {/* URL */}
                    {bookmark.url && (
                        <View className="flex-row items-center mt-2">
                            <Ionicons name="link" size={14} color="#9CA3AF"/>
                            <Text className="text-xs text-gray-400 ml-2 flex-1" numberOfLines={1}>
                                {bookmark.url}
                            </Text>
                        </View>
                    )}
                </View>

                {/* ── Attractions section ─────────────────────────────────── */}
                <View className="m-4">
                    {/*<ThemedText className="mb-3 font-bold" textStyle={"caption"}>🗺️ 景點</ThemedText>*/}
                    <AttractionGroupSection
                        attractions={bookmark.attractions}
                        onToggleVisited={handleToggleVisited}
                    />
                </View>

                {/* Bottom spacing */}
                <View style={{height: Math.max(insets.bottom, 16) + 16}}/>
            </ScrollView>
        </View>
    );
}

// ─── Small local helper: expandable description ────────────────────────────
function ExpandableDescription({description}: { description: string }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <View className="mb-1">
            <Text
                className="text-sm text-gray-600"
                numberOfLines={expanded ? undefined : 3}>
                {description}
            </Text>
            <TouchableOpacity
                onPress={() => setExpanded(prev => !prev)}
                className="flex-row items-center mt-1">
                <Text className="text-xs text-blue-500 font-semibold">
                    {expanded ? 'Show less' : 'Show more'}
                </Text>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    color="#3B82F6"
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});
