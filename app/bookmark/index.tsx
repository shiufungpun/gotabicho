import React, {useCallback, useMemo, useRef, useState} from 'react';
import {FlatList, RefreshControl, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {useBookmarks} from '../../src/hooks/useBookmarks';
import {useTheme} from '../../src/theme';
import {AddBookmarkModal, FilterChips, GlassButton, ThemedText, ThemedView} from '../../src/components';
import {MapPin, MapPinsView} from '../../src/components/bookmark/MapPinsView';
import {MinimalCard} from '../../src/components/bookmark/MinimalCard';
import {BOOKMARK_PIN_COLORS, getMockCoordinate} from '../../src/helpers/mockCoordinates';
import {getTypeColor, getTypeIcon} from '../../src/components/bookmark/AttractionCard';
import {useAIExtraction} from '../../src/providers';
import {BookmarkSource} from '../../src/types';

type Tab = 'bookmarks' | 'attractions';

const ATTRACTION_TYPES = ['All', 'sight', 'restaurant', 'shopping', 'play', 'hotel'];
const SOURCE_FILTERS = ['All', BookmarkSource.Instagram, BookmarkSource.Threads, BookmarkSource.Other];

export default function BookmarkIndexScreen() {
    const {
        bookmarks,
        attractions,
        loading,
        refresh,
    } = useBookmarks();
    const {queueExtraction} = useAIExtraction();
    const {colors} = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<Tab>('bookmarks');
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

    const activeItems: any[] =
        activeTab === 'bookmarks' ? filteredBookmarks : filteredAttractions;

    // ─── map pins ─────────────────────────────────────────────────────────────
    const pins: MapPin[] = useMemo(() => {
        return activeItems.map((item, index) => ({
            id: item.id,
            coordinate: getMockCoordinate(item.id, index),
            color:
                activeTab === 'bookmarks'
                    ? BOOKMARK_PIN_COLORS[index % BOOKMARK_PIN_COLORS.length]
                    : getTypeColor(item.type),
        }));
    }, [activeItems, activeTab]);

    // ─── handlers ─────────────────────────────────────────────────────────────
    const handleCardPress = useCallback(
        (item: any) => {
            const targetId =
                activeTab === 'bookmarks' ? item.id : item.bookmark_id;
            setSelectedId(item.id);
            router.push(`/bookmark/${targetId}`);
        },
        [activeTab, router],
    );

    const handlePinPress = useCallback(
        (id: number) => {
            setSelectedId(id);
            const index = activeItems.findIndex(i => i.id === id);
            if (index !== -1) {
                // Expand the sheet so the list is visible, then scroll to item
                sheetRef.current?.resize(1);
                listRef.current?.scrollToIndex({index, animated: true, viewPosition: 0.3});
            }
        },
        [activeItems],
    );

    const handleBookmarkCreated = async (bookmarkId: number, content: string) => {
        setShowAddModal(false);
        await queueExtraction(bookmarkId, content);
        refresh();
        router.push(`/bookmark/${bookmarkId}`);
    };

    const handleOpenSheet = useCallback(() => {
        sheetRef.current?.present();
    }, []);

    // ─── sheet header (tabs + filter chips) ──────────────────────────────────
    const SheetHeader = (
        <View
            className="border-b"
            style={{backgroundColor: colors.surface, borderBottomColor: colors.border}}
        >
            {/* Drag handle */}
            <View className="items-center py-2">
                <View
                    className="w-9 h-1 rounded-full"
                    style={{backgroundColor: colors.border}}
                />
            </View>

            {/* Tabs */}
            <View className="flex-row h-10">
                {(['bookmarks', 'attractions'] as Tab[]).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => {
                            setActiveTab(tab);
                            setSelectedId(null);
                        }}
                        className="flex-1 items-center justify-center border-b-2"
                        style={{borderBottomColor: activeTab === tab ? colors.primary : 'transparent'}}
                    >
                        <ThemedText
                            style={{
                                fontSize: 13,
                                fontWeight: activeTab === tab ? '700' : '400',
                                color: activeTab === tab ? colors.primary : colors.textSecondary,
                                textTransform: 'capitalize',
                            }}
                        >
                            {tab}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Filter chips */}
            <View className="h-11 justify-center">
                {activeTab === 'bookmarks' ? (
                    <FilterChips
                        options={SOURCE_FILTERS}
                        selected={sourceFilter}
                        onChange={f => {
                            setSourceFilter(f);
                            setSelectedId(null);
                        }}
                    />
                ) : (
                    <FilterChips
                        options={ATTRACTION_TYPES}
                        selected={typeFilter}
                        onChange={f => {
                            setTypeFilter(f);
                            setSelectedId(null);
                        }}
                    />
                )}
            </View>
        </View>
    );

    // ─── render card ──────────────────────────────────────────────────────────
    const renderItem = useCallback(
        ({item, index}: { item: any; index: number }) => {
            if (activeTab === 'bookmarks') {
                const pinColor = BOOKMARK_PIN_COLORS[index % BOOKMARK_PIN_COLORS.length];
                return (
                    <MinimalCard
                        title={item.title}
                        subtitle={`${item.attraction_count ?? 0} attraction${item.attraction_count !== 1 ? 's' : ''}`}
                        pinColor={pinColor}
                        isSelected={selectedId === item.id}
                        visited={!!item.visited}
                        onPress={() => handleCardPress(item)}
                    />
                );
            }
            const typeColor = getTypeColor(item.type);
            return (
                <MinimalCard
                    title={item.title}
                    subtitle={item.location || item.type}
                    pinColor={typeColor}
                    iconName={getTypeIcon(item.type)}
                    isSelected={selectedId === item.id}
                    visited={!!item.visited}
                    onPress={() => handleCardPress(item)}
                />
            );
        },
        [activeTab, selectedId, handleCardPress],
    );

    // ─── layout ───────────────────────────────────────────────────────────────
    return (
        <ThemedView className="flex-1">
            {/* ── Full-screen map background ───────────────────────────── */}
            <View className="absolute inset-0">
                <MapPinsView
                    pins={pins}
                    selectedId={selectedId}
                    onPinPress={handlePinPress}
                />
            </View>


            {/* ── Floating glass button ── */}
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

            {/* ── Bottom sheet with card list ───────────────────────────── */}
            <TrueSheet
                ref={sheetRef}
                detents={[0.18, 0.5, 1]}
                dismissible={true}
                dimmed={false}
                scrollable
                header={SheetHeader}
                headerStyle={{backgroundColor: colors.surface}}
                backgroundColor={colors.surface}
                cornerRadius={20}
                initialDetentIndex={1}
            >
                <FlatList
                    ref={listRef}
                    data={activeItems}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerClassName="pt-1 pb-8"
                    nestedScrollEnabled
                    onScrollToIndexFailed={() => {
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center pt-10 px-8">
                            <Ionicons
                                name={activeTab === 'bookmarks' ? 'bookmark-outline' : 'map-outline'}
                                size={48}
                                color={colors.textTertiary}
                            />
                            <ThemedText
                                variant="tertiary"
                                className="text-center mt-2.5 text-sm"
                            >
                                {activeTab === 'bookmarks'
                                    ? 'No bookmarks yet.\nTap + to add your first one!'
                                    : 'No attractions found.\nSave bookmarks and let AI extract them.'}
                            </ThemedText>
                        </View>
                    }
                />
            </TrueSheet>

            {/* ── Add Bookmark Modal ────────────────────────────────────── */}
            <AddBookmarkModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onCreated={handleBookmarkCreated}
            />
        </ThemedView>
    );
}
