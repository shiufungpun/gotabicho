import React, {forwardRef} from 'react';
import {FlatList} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {useTheme} from '../../theme';
import {BookmarkSheetHeader, BookmarkTab} from '../../components/bookmark/BookmarkSheetHeader';
import {BookmarkListContainer} from './BookmarkListContainer';
import {AttractionWithBookmark, BookmarkWithCount} from '../../repositories/bookmarkRepository';

interface BookmarkSheetContainerProps {
    activeTab: BookmarkTab;
    sourceFilter: string;
    typeFilter: string;
    bookmarks: BookmarkWithCount[];
    attractions: AttractionWithBookmark[];
    selectedId: number | null;
    loading: boolean;
    onTabChange: (tab: BookmarkTab) => void;
    onSourceFilterChange: (filter: string) => void;
    onTypeFilterChange: (filter: string) => void;
    onRefresh: () => void;
    onBookmarkPress: (item: BookmarkWithCount) => void;
    onAttractionPress: (item: AttractionWithBookmark) => void;
    listRef: React.RefObject<FlatList | null>;
}

export const BookmarkSheetContainer = forwardRef<TrueSheet, BookmarkSheetContainerProps>(
    function BookmarkSheetContainer(
        {
            activeTab,
            sourceFilter,
            typeFilter,
            bookmarks,
            attractions,
            selectedId,
            loading,
            onTabChange,
            onSourceFilterChange,
            onTypeFilterChange,
            onRefresh,
            onBookmarkPress,
            onAttractionPress,
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
                    listRef={listRef}
                    bookmarks={bookmarks}
                    attractions={attractions}
                    activeTab={activeTab}
                    selectedId={selectedId}
                    loading={loading}
                    onRefresh={onRefresh}
                    onBookmarkPress={onBookmarkPress}
                    onAttractionPress={onAttractionPress}
                />
            </TrueSheet>
        );
    },
);

