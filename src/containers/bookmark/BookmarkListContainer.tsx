import React, {forwardRef, useCallback} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../../theme';
import {AttractionSheetCard, BookmarkSheetCard, BookmarkTab, ThemedText} from '../../components';
import {AttractionWithBookmark, BookmarkWithCount} from '../../repositories/bookmarkRepository';

interface BookmarkListContainerProps {
    bookmarks: BookmarkWithCount[];
    attractions: AttractionWithBookmark[];
    activeTab: BookmarkTab;
    selectedId: number | null;
    loading: boolean;
    onRefresh: () => void;
    onBookmarkPress: (item: BookmarkWithCount) => void;
    onAttractionPress: (item: AttractionWithBookmark) => void;
    listRef: React.RefObject<FlatList | null>;
}

export const BookmarkListContainer = forwardRef<FlatList, BookmarkListContainerProps>(
    function BookmarkListContainer(
        {
            bookmarks,
            attractions,
            activeTab,
            selectedId,
            loading,
            onRefresh,
            onBookmarkPress,
            onAttractionPress,
            listRef
        },
        _ref,
    ) {
        const {colors} = useTheme();

        const renderBookmark = useCallback(
            ({item}: { item: BookmarkWithCount }) => (
                <BookmarkSheetCard bookmark={item} onPress={onBookmarkPress}/>
            ),
            [onBookmarkPress],
        );

        const renderAttraction = useCallback(
            ({item}: { item: AttractionWithBookmark }) => (
                <AttractionSheetCard
                    attraction={item}
                    isSelected={selectedId === item.id}
                    onPress={onAttractionPress}
                />
            ),
            [selectedId, onAttractionPress],
        );

        if (activeTab === 'bookmarks') {
            return (
                <FlatList
                    ref={listRef}
                    data={bookmarks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderBookmark}
                    contentContainerClassName="pt-1 pb-8"
                    nestedScrollEnabled
                    onScrollToIndexFailed={() => {
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center pt-10 px-8">
                            <Ionicons name="bookmark-outline" size={48} color={colors.textTertiary}/>
                            <ThemedText variant="tertiary" className="text-center mt-2.5 text-sm">
                                {'No bookmarks yet.\nTap + to add your first one!'}
                            </ThemedText>
                        </View>
                    }
                />
            );
        }

        return (
            <FlatList
                ref={listRef}
                data={attractions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAttraction}
                contentContainerClassName="pt-1 pb-8"
                nestedScrollEnabled
                onScrollToIndexFailed={() => {
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View className="items-center pt-10 px-8">
                        <Ionicons name="map-outline" size={48} color={colors.textTertiary}/>
                        <ThemedText variant="tertiary" className="text-center mt-2.5 text-sm">
                            {'No attractions found.\nSave bookmarks and let AI extract them.'}
                        </ThemedText>
                    </View>
                }
            />
        );
    },
);


