import React, {useMemo, useRef, useState} from 'react';
import {Alert, Animated, RefreshControl, TouchableOpacity, View,} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useBookmarks} from '../../src/hooks/useBookmarks';
import {useTheme} from '../../src/theme';
import {ThemedText, ThemedView} from '../../src/components';
import {BookmarkCard} from '../../src/components/bookmark/BookmarkCard';
import {AttractionCard} from '../../src/components/bookmark/AttractionCard';
import {FilterChips} from '../../src/components/bookmark/FilterChips';
import {AddBookmarkModal} from '../../src/components/bookmark/AddBookmarkModal';
import {useAIExtraction} from '../../src/providers';
import {BookmarkSource} from '../../src/types';

type Tab = 'bookmarks' | 'attractions';

const ATTRACTION_TYPES = ['All', 'sight', 'restaurant', 'shopping', 'play', 'hotel'];
const SOURCE_FILTERS = ['All', BookmarkSource.Instagram, BookmarkSource.Threads, BookmarkSource.Other];

const HEADER_MAX_HEIGHT = 110;
const HEADER_MIN_HEIGHT = 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function BookmarkIndexScreen() {
    const {
        bookmarks,
        attractions,
        loading,
        refresh,
        toggleBookmarkVisited,
        toggleAttractionVisited,
        removeBookmark
    } = useBookmarks();
    const {queueExtraction} = useAIExtraction();
    const {colors} = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<Tab>('bookmarks');
    const [sourceFilter, setSourceFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT + insets.top, HEADER_MIN_HEIGHT + insets.top],
        extrapolate: 'clamp',
    });

    const titleFontSize = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [36, 22],
        extrapolate: 'clamp',
    });

    const filteredBookmarks = useMemo(() => {
        if (sourceFilter === 'All') return bookmarks;
        return bookmarks.filter(b => (b.source ?? BookmarkSource.Other) === sourceFilter);
    }, [bookmarks, sourceFilter]);

    const filteredAttractions = useMemo(() => {
        if (typeFilter === 'All') return attractions;
        return attractions.filter(a => a.type === typeFilter);
    }, [attractions, typeFilter]);

    const handleBookmarkCreated = async (bookmarkId: number, content: string) => {
        setShowAddModal(false);
        await queueExtraction(bookmarkId, content);
        refresh();
        // Navigate to bookmark detail
        router.push(`/bookmark/${bookmarkId}`);
    };

    const handleDeleteBookmark = (id: number, title: string) => {
        Alert.alert(
            'Delete Bookmark',
            `Are you sure you want to delete "${title}"? This will also remove all its attractions.`,
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => removeBookmark(id),
                },
            ]
        );
    };

    const tabBarHeight = 48;
    const filterBarHeight = 48;
    const contentTopPadding = HEADER_MAX_HEIGHT + insets.top + tabBarHeight + filterBarHeight + 8;

    return (
        <ThemedView style={{flex: 1}}>
            {/* Scrollable list */}
            <Animated.FlatList
                data={activeTab === 'bookmarks' ? filteredBookmarks : filteredAttractions}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({item}: { item: any }) => {
                    if (activeTab === 'bookmarks') {
                        return (
                            <BookmarkCard
                                bookmark={item}
                                onPress={() => router.push(`/bookmark/${item.id}`)}
                                onToggleVisited={() => toggleBookmarkVisited(item.id, item.visited ?? false)}
                                onDelete={() => handleDeleteBookmark(item.id, item.title)}
                            />
                        );
                    }
                    return (
                        <AttractionCard
                            attraction={item}
                            onPress={() => router.push(`/bookmark/${item.bookmark_id}`)}
                            onToggleVisited={() => toggleAttractionVisited(item.id, item.visited ?? false)}
                        />
                    );
                }}
                contentContainerStyle={{
                    paddingTop: contentTopPadding,
                    paddingBottom: 80,
                }}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {useNativeDriver: false}
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refresh}
                        progressViewOffset={contentTopPadding}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={{alignItems: 'center', paddingTop: 60, paddingHorizontal: 32}}>
                        <Ionicons
                            name={activeTab === 'bookmarks' ? 'bookmark-outline' : 'map-outline'}
                            size={56}
                            color={colors.textTertiary}
                        />
                        <ThemedText variant="tertiary" style={{textAlign: 'center', marginTop: 12, fontSize: 15}}>
                            {activeTab === 'bookmarks'
                                ? 'No bookmarks yet.\nTap + to add your first one!'
                                : 'No attractions found.\nSave bookmarks and let AI extract them.'}
                        </ThemedText>
                    </View>
                }
            />

            {/* Fixed Header */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: headerHeight,
                    backgroundColor: colors.surface,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    shadowColor: colors.shadow,
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    shadowOffset: {width: 0, height: 2},
                    elevation: 4,
                    zIndex: 10,
                    justifyContent: 'flex-end',
                    paddingBottom: 10,
                    paddingTop: insets.top,
                }}
            >
                <View style={{
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Animated.Text
                        style={{fontSize: titleFontSize, color: colors.text, fontFamily: 'HinaMincho_400Regular'}}
                    >
                        Bookmarks
                    </Animated.Text>
                    <TouchableOpacity
                        onPress={() => setShowAddModal(true)}
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            backgroundColor: colors.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="add" size={22} color="white"/>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Fixed Tab Bar */}
            <View
                style={{
                    position: 'absolute',
                    top: HEADER_MAX_HEIGHT + insets.top,
                    left: 0,
                    right: 0,
                    height: tabBarHeight,
                    backgroundColor: colors.surface,
                    flexDirection: 'row',
                    zIndex: 9,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                }}
            >
                {(['bookmarks', 'attractions'] as Tab[]).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottomWidth: 2,
                            borderBottomColor: activeTab === tab ? colors.primary : 'transparent',
                        }}
                    >
                        <ThemedText
                            style={{
                                fontSize: 14,
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

            {/* Fixed Filter Chips */}
            <View
                style={{
                    position: 'absolute',
                    top: HEADER_MAX_HEIGHT + insets.top + tabBarHeight,
                    left: 0,
                    right: 0,
                    height: filterBarHeight,
                    backgroundColor: colors.surface,
                    zIndex: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider,
                }}
            >
                {activeTab === 'bookmarks' ? (
                    <FilterChips
                        options={SOURCE_FILTERS}
                        selected={sourceFilter}
                        onChange={setSourceFilter}
                    />
                ) : (
                    <FilterChips
                        options={ATTRACTION_TYPES}
                        selected={typeFilter}
                        onChange={setTypeFilter}
                    />
                )}
            </View>

            {/* Add Bookmark Modal */}
            <AddBookmarkModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onCreated={handleBookmarkCreated}
            />
        </ThemedView>
    );
}

