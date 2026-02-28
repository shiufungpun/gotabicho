import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTheme} from '../../theme';
import {FilterChips, ThemedText} from '../index';
import {BookmarkSource} from '../../types';

export type BookmarkTab = 'bookmarks' | 'attractions';

const ATTRACTION_TYPES = ['All', 'sight', 'restaurant', 'shopping', 'play', 'hotel'];
const SOURCE_FILTERS = ['All', BookmarkSource.Instagram, BookmarkSource.Threads, BookmarkSource.Other];

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

