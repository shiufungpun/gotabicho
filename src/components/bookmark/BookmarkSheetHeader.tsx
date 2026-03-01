import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTheme} from '../../theme';
import {FilterChips, ThemedText} from '../index';
import {BookmarkSource} from '../../types';

export type BookmarkTab = 'bookmarks' | 'attractions';


const ATTRACTION_TYPES: Record<string, string> = {
    All: '全部',
    sight: '景點',
    restaurant: '餐廳',
    shopping: '購物',
    play: '娛樂',
    hotel: '住宿',
};
const SOURCE_FILTERS: Record<string, string> = {
    All: '全部',
    [BookmarkSource.Instagram]: BookmarkSource.Instagram,
    [BookmarkSource.Threads]: BookmarkSource.Threads,
    [BookmarkSource.Other]: '其他',
};

interface BookmarkSheetHeaderProps {
    activeTab: BookmarkTab;
    sourceFilter: string;
    typeFilter: string;
    onTabChange: (tab: BookmarkTab) => void;
    onSourceFilterChange: (filter: string) => void;
    onTypeFilterChange: (filter: string) => void;
}

export function BookmarkSheetHeader({
                                        activeTab,
                                        sourceFilter,
                                        typeFilter,
                                        onTabChange,
                                        onSourceFilterChange,
                                        onTypeFilterChange,
                                    }: BookmarkSheetHeaderProps) {
    const {colors} = useTheme();

    return (
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
                {(['attractions', 'bookmarks'] as BookmarkTab[]).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => onTabChange(tab)}
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
                            {tab === 'attractions' ? '景點' : '收藏'}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Filter chips */}
            <View className="h-15 justify-center">
                {activeTab === 'bookmarks' ? (
                    <FilterChips
                        options={SOURCE_FILTERS}
                        selected={sourceFilter}
                        onChange={onSourceFilterChange}
                    />
                ) : (
                    <FilterChips
                        options={ATTRACTION_TYPES}
                        selected={typeFilter}
                        onChange={onTypeFilterChange}
                    />
                )}
            </View>
        </View>
    );
}

