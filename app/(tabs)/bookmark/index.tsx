import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Alert, FlatList, View} from 'react-native';
import {useRouter} from 'expo-router';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {useBookmarks} from '../../../src/hooks/useBookmarks';
import {useBookmarkSelection} from '../../../src/hooks/useBookmarkSelection';
import {useTrips} from '../../../src/hooks/useTrips';
import {AddBookmarkModal, BookmarkTab, GlassButton, ThemedView} from '../../../src/components';
import {TripPickerModal} from '../../../src/components/bookmark/TripPickerModal';
import {MapPin} from '../../../src/components/bookmark/MapPinsView';
import {getMockCoordinate} from '../../../src/helpers/mockCoordinates';
import {getTypeColor} from '../../../src/helpers/attractionHelpers';
import {useAIExtraction} from '../../../src/providers';
import {BookmarkSource} from '../../../src/types';
import {BookmarkMapContainer, BookmarkSheetContainer} from '../../../src/containers/bookmark';
import {Ionicons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
    AttractionWithBookmark,
    BookmarkWithCount,
    deleteAttractions,
    deleteBookmarks,
    getAttractionIdsByBookmarkIds,
    linkAttractionsToTrips,
} from '../../../src/repositories/bookmarkRepository';
import {notifyBookmarkChange} from '../../../src/services/dataEventEmitter';

export default function BookmarkIndexScreen() {
    const {bookmarks, attractions, loading, refresh} = useBookmarks();
    const {queueExtraction} = useAIExtraction();
    const {trips} = useTrips();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [activeTab, setActiveTab] = useState<BookmarkTab>('attractions');
    const [sourceFilter, setSourceFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showTripPicker, setShowTripPicker] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const sheetRef = useRef<TrueSheet>(null);
    const listRef = useRef<FlatList>(null);

    const {isSelecting, selectedIds, selectionTab, toggleSelect, clearSelection} =
        useBookmarkSelection(activeTab);

    // ─── filtered data ────────────────────────────────────────────────────────
    const filteredBookmarks = useMemo(() => {
        if (sourceFilter === 'All') return bookmarks;
        return bookmarks.filter(b => (b.source ?? BookmarkSource.Other) === sourceFilter);
    }, [bookmarks, sourceFilter]);

    const filteredAttractions = useMemo(() => {
        if (typeFilter === 'All') return attractions;
        return attractions.filter(a => a.type === typeFilter);
    }, [attractions, typeFilter]);

    // ─── map pins ─────────────────────────────────────────────────────────────
    const pins: MapPin[] = useMemo(
        () =>
            filteredAttractions.map((item, index) => ({
                id: item.id,
                coordinate: getMockCoordinate(item.id, index),
                color: getTypeColor(item.type),
            })),
        [filteredAttractions],
    );

    // ─── resolve attraction IDs for "add to trip" ─────────────────────────────
    const resolveAttractionIds = useCallback(async (): Promise<number[]> => {
        const ids = Array.from(selectedIds);
        if (selectionTab === 'attractions') return ids;
        return getAttractionIdsByBookmarkIds(ids);
    }, [selectedIds, selectionTab]);

    // ─── card handlers ────────────────────────────────────────────────────────
    const handleBookmarkPress = useCallback(
        (item: BookmarkWithCount) => {
            router.push(`/bookmark/${item.id}`);
        },
        [router],
    );

    const handleAttractionPress = useCallback(
        (item: AttractionWithBookmark) => {
            setSelectedId(item.id);
        },
        [],
    );

    const handleBookmarkToggleCheck = useCallback(
        (item: BookmarkWithCount) => {
            toggleSelect(item.id);
        },
        [toggleSelect],
    );

    const handleAttractionToggleCheck = useCallback(
        (item: AttractionWithBookmark) => {
            toggleSelect(item.id);
        },
        [toggleSelect],
    );

    const handlePinPress = useCallback(
        (id: number) => {
            setSelectedId(id);
            const index = filteredAttractions.findIndex(i => i.id === id);
            if (index !== -1) {
                sheetRef.current?.resize(1);
                listRef.current?.scrollToIndex({index, animated: true, viewPosition: 0.3});
            }
        },
        [filteredAttractions],
    );

    const handleTabChange = useCallback(
        (tab: BookmarkTab) => {
            setActiveTab(tab);
            setSelectedId(null);
            clearSelection();
        },
        [clearSelection],
    );

    const handleSourceFilterChange = useCallback((f: string) => {
        setSourceFilter(f);
        setSelectedId(null);
    }, []);

    const handleTypeFilterChange = useCallback((f: string) => {
        setTypeFilter(f);
        setSelectedId(null);
    }, []);

    const handleBookmarkCreated = async (bookmarkId: number, content: string) => {
        setShowAddModal(false);
        await queueExtraction(bookmarkId, content);
        refresh();
        router.push(`/bookmark/${bookmarkId}`);
    };

    const handleOpenSheet = useCallback(() => {
        sheetRef.current?.present();
    }, []);

    // ─── selection: add to trip ───────────────────────────────────────────────
    const handleAddToTrip = useCallback(() => {
        setShowTripPicker(true);
    }, []);

    const handleTripPickerConfirm = useCallback(
        async (tripIds: number[]) => {
            setShowTripPicker(false);
            if (tripIds.length === 0) return;
            setActionLoading(true);
            try {
                const attractionIds = await resolveAttractionIds();
                if (attractionIds.length === 0) {
                    Alert.alert('No attractions', 'The selected bookmarks have no extracted attractions yet.');
                    return;
                }
                await linkAttractionsToTrips(attractionIds, tripIds);
                const label = selectionTab === 'bookmarks' ? 'bookmark' : 'attraction';
                const count = selectedIds.size;
                Alert.alert(
                    'Added to Trip ✓',
                    `${attractionIds.length} attraction${attractionIds.length !== 1 ? 's' : ''} from ${count} ${label}${count !== 1 ? 's' : ''} added to ${tripIds.length} trip${tripIds.length !== 1 ? 's' : ''}.`,
                );
                clearSelection();
            } catch (e) {
                console.error('[BookmarkScreen] linkAttractionsToTrips error:', e);
                Alert.alert('Error', 'Failed to add attractions to trips. Please try again.');
            } finally {
                setActionLoading(false);
            }
        },
        [resolveAttractionIds, selectionTab, selectedIds, clearSelection],
    );

    // ─── selection: delete ────────────────────────────────────────────────────
    const handleDelete = useCallback(() => {
        const ids = Array.from(selectedIds);
        const label = selectionTab === 'bookmarks' ? 'bookmark' : 'attraction';
        Alert.alert(
            `Delete ${ids.length} ${label}${ids.length !== 1 ? 's' : ''}?`,
            selectionTab === 'bookmarks'
                ? 'This will also delete all their extracted attractions.'
                : 'This will permanently remove the selected attractions.',
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            if (selectionTab === 'bookmarks') {
                                await deleteBookmarks(ids);
                            } else {
                                await deleteAttractions(ids);
                            }
                            notifyBookmarkChange();
                            refresh();
                            clearSelection();
                        } catch (e) {
                            console.error('[BookmarkScreen] delete error:', e);
                            Alert.alert('Error', 'Failed to delete. Please try again.');
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ],
        );
    }, [selectedIds, selectionTab, refresh, clearSelection]);

    // ─── layout ───────────────────────────────────────────────────────────────
    return (
        <ThemedView className="flex-1">
            <BookmarkMapContainer
                pins={pins}
                selectedId={selectedId}
                onPinPress={handlePinPress}
            />

            {/* Floating glass button to open the bottom sheet */}
            <View
                style={{
                    position: 'absolute',
                    bottom: insets.bottom + 63,
                    alignSelf: 'center',
                }}
            >
                <GlassButton
                    icon={<Ionicons name="menu" size={22} color="#000"/>}
                    onPress={handleOpenSheet}
                />
            </View>

            <BookmarkSheetContainer
                ref={sheetRef}
                listRef={listRef}
                activeTab={activeTab}
                sourceFilter={sourceFilter}
                typeFilter={typeFilter}
                bookmarks={filteredBookmarks}
                attractions={filteredAttractions}
                selectedId={selectedId}
                loading={loading}
                onTabChange={handleTabChange}
                onSourceFilterChange={handleSourceFilterChange}
                onTypeFilterChange={handleTypeFilterChange}
                onRefresh={refresh}
                onBookmarkPress={handleBookmarkPress}
                onAttractionPress={handleAttractionPress}
                onBookmarkToggleCheck={handleBookmarkToggleCheck}
                onAttractionToggleCheck={handleAttractionToggleCheck}
                selectedIds={selectedIds}
                isSelecting={isSelecting}
                actionLoading={actionLoading}
                onAddToTrip={handleAddToTrip}
                onDelete={handleDelete}
                onCancelSelection={clearSelection}
            />

            <AddBookmarkModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onCreated={handleBookmarkCreated}
            />

            <TripPickerModal
                visible={showTripPicker}
                trips={trips}
                onConfirm={handleTripPickerConfirm}
                onCancel={() => setShowTripPicker(false)}
            />
        </ThemedView>
    );
}
