import React, {forwardRef, useCallback} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../../theme';
import {BookmarkListItem, BookmarkTab, ThemedText} from '../../components';

interface BookmarkListContainerProps {
    items: any[];
    activeTab: BookmarkTab;
    selectedId: number | null;
    loading: boolean;
    onRefresh: () => void;
    onItemPress: (item: any) => void;
}

export const BookmarkListContainer = forwardRef<FlatList, BookmarkListContainerProps>(
    function BookmarkListContainer(
        {items, activeTab, selectedId, loading, onRefresh, onItemPress},
        ref,
    ) {
        const {colors} = useTheme();

        const renderItem = useCallback(
            ({item, index}: { item: any; index: number }) => (
                <BookmarkListItem
                    item={item}
                    index={index}
                    activeTab={activeTab}
                    selectedId={selectedId}
                    onPress={onItemPress}
                />
            ),
            [activeTab, selectedId, onItemPress],
        );

        return (
            <FlatList
                ref={ref}
                data={items}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={renderItem}
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
                        <Ionicons
                            name={activeTab === 'bookmarks' ? 'bookmark-outline' : 'map-outline'}
                            size={48}
                            color={colors.textTertiary}
                        />
                        <ThemedText variant="tertiary" className="text-center mt-2.5 text-sm">
                            {activeTab === 'bookmarks'
                                ? 'No bookmarks yet.\nTap + to add your first one!'
                                : 'No attractions found.\nSave bookmarks and let AI extract them.'}
                        </ThemedText>
                    </View>
                }
            />
        );
    },
);


