import React, {useCallback, useMemo, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';
import {useRouter} from 'expo-router';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {useBookmarks} from '../../../src/hooks/useBookmarks';
import {AddBookmarkModal, BookmarkTab, GlassButton, ThemedView} from '../../../src/components';
import {MapPin} from '../../../src/components/bookmark/MapPinsView';
import {getMockCoordinate} from '../../../src/helpers/mockCoordinates';
import {getTypeColor} from '../../../src/helpers/attractionHelpers';
import {useAIExtraction} from '../../../src/providers';
import {BookmarkSource} from '../../../src/types';
import {BookmarkMapContainer, BookmarkSheetContainer,} from '../../../src/containers/bookmark';
import {Ionicons} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {AttractionWithBookmark, BookmarkWithCount} from '../../../src/repositories/bookmarkRepository';

export default function BookmarkIndexScreen() {
    const {bookmarks, attractions, loading, refresh} = useBookmarks();
    const {queueExtraction} = useAIExtraction();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [activeTab, setActiveTab] = useState<BookmarkTab>('attractions');
    const [sourceFilter, setSourceFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const sheetRef = useRef<TrueSheet>(null);
    const listRef = useRef<FlatList>(null);

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

    // ─── handlers ─────────────────────────────────────────────────────────────
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

    const handleTabChange = useCallback((tab: BookmarkTab) => {
        setActiveTab(tab);
        setSelectedId(null);
    }, []);

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
            />

            <AddBookmarkModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onCreated={handleBookmarkCreated}
            />
        </ThemedView>
    );
}
