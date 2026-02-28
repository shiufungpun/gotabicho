import React, {forwardRef} from 'react';
import {FlatList} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {useTheme} from '../../theme';
import {BookmarkSheetHeader, BookmarkTab} from '../../components/bookmark/BookmarkSheetHeader';
import {BookmarkListContainer} from './BookmarkListContainer';

interface BookmarkSheetContainerProps {
    activeTab: BookmarkTab;
    sourceFilter: string;
    typeFilter: string;
    items: any[];
    selectedId: number | null;
    loading: boolean;
    onTabChange: (tab: BookmarkTab) => void;
    onSourceFilterChange: (filter: string) => void;
    onTypeFilterChange: (filter: string) => void;
    onRefresh: () => void;
    onItemPress: (item: any) => void;
    listRef: React.RefObject<FlatList>;
}

export const BookmarkSheetContainer = forwardRef<TrueSheet, BookmarkSheetContainerProps>(
    function BookmarkSheetContainer(
        {
            activeTab,
            sourceFilter,
            typeFilter,
            items,
            selectedId,
            loading,
            onTabChange,
            onSourceFilterChange,
            onTypeFilterChange,
            onRefresh,
            onItemPress,
            listRef,
        },
        ref,
    ) {
        const {colors} = useTheme();

        const header = (
            <BookmarkSheetHeader
                activeTab={activeTab}
                sourceFilter={sourceFilter}
                typeFilter={typeFilter}
                onTabChange={onTabChange}
                onSourceFilterChange={onSourceFilterChange}
                onTypeFilterChange={onTypeFilterChange}
            />
        );

        return (
            <TrueSheet
                ref={ref}
                detents={[0.18, 0.5, 1]}
                dismissible={true}
                dimmed={false}
                scrollable
                header={header}
                headerStyle={{backgroundColor: colors.surface}}
                backgroundColor={colors.surface}
                cornerRadius={20}
                initialDetentIndex={0}
            >
                <BookmarkListContainer
                    ref={listRef}
                    items={items}
                    activeTab={activeTab}
                    selectedId={selectedId}
                    loading={loading}
                    onRefresh={onRefresh}
                    onItemPress={onItemPress}
                />
            </TrueSheet>
        );
    },
);

