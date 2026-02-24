import React, {useCallback, useMemo, useRef, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useBookmarks} from '../../src/hooks/useBookmarks';
import {useTheme} from '../../src/theme';
import {ThemedText, ThemedView} from '../../src/components';
import {FilterChips} from '../../src/components/bookmark/FilterChips';
import {AddBookmarkModal} from '../../src/components/bookmark/AddBookmarkModal';
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
        <ThemedView style={styles.root}>
            {/* ── Top bar ─────────────────────────────────────────────────── */}
            <View
                style={[
                    styles.topBar,
                    {
                        paddingTop: insets.top + 8,
                        backgroundColor: colors.surface,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <Text
                    style={[styles.title, {color: colors.text, fontFamily: 'HinaMincho_400Regular'}]}
                >
                    Bookmarks
                </Text>
                <TouchableOpacity
                    onPress={() => setShowAddModal(true)}
                    style={[styles.addButton, {backgroundColor: colors.primary}]}
                >
                    <Ionicons name="add" size={22} color="white"/>
                </TouchableOpacity>
            </View>

            {/* ── Map (top ~45%) ───────────────────────────────────────────── */}
            <View style={styles.mapContainer}>
                <MapPinsView
                    pins={pins}
                    selectedId={selectedId}
                    onPinPress={handlePinPress}
                />
            </View>

            {/* ── Tab + filter bar ────────────────────────────────────────── */}
            <View style={[styles.controlBar, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
                {/* Tabs */}
                <View style={styles.tabs}>
                    {(['bookmarks', 'attractions'] as Tab[]).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => {
                                setActiveTab(tab);
                                setSelectedId(null);
                            }}
                            style={[
                                styles.tab,
                                {
                                    borderBottomColor:
                                        activeTab === tab ? colors.primary : 'transparent',
                                },
                            ]}
                        >
                            <ThemedText
                                style={{
                                    fontSize: 13,
                                    fontWeight: activeTab === tab ? '700' : '400',
                                    color:
                                        activeTab === tab
                                            ? colors.primary
                                            : colors.textSecondary,
                                    textTransform: 'capitalize',
                                }}
                            >
                                {tab}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Filter chips */}
                <View style={styles.filterRow}>
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

            {/* ── Card list (bottom ~55%) ──────────────────────────────────── */}
            <FlatList
                ref={listRef}
                style={styles.list}
                data={activeItems}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
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
                    <View style={styles.empty}>
                        <Ionicons
                            name={activeTab === 'bookmarks' ? 'bookmark-outline' : 'map-outline'}
                            size={48}
                            color={colors.textTertiary}
                        />
                        <ThemedText
                            variant="tertiary"
                            style={styles.emptyText}
                        >
                            {activeTab === 'bookmarks'
                                ? 'No bookmarks yet.\nTap + to add your first one!'
                                : 'No attractions found.\nSave bookmarks and let AI extract them.'}
                        </ThemedText>
                    </View>
                }
            />

            {/* ── Add Bookmark Modal ───────────────────────────────────────── */}
            <AddBookmarkModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onCreated={handleBookmarkCreated}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    title: {
        fontSize: 28,
    },
    addButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapContainer: {
        flex: 4,   // ~44% of remaining space
    },
    controlBar: {
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    tabs: {
        flexDirection: 'row',
        height: 40,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 2,
    },
    filterRow: {
        height: 44,
        justifyContent: 'center',
    },
    list: {
        flex: 5,   // ~56% of remaining space
    },
    listContent: {
        paddingTop: 4,
        paddingBottom: 16,
    },
    empty: {
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 32,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
    },
});
