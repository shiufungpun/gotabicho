import React from 'react';
import {MinimalCard} from './MinimalCard';
import {getTypeColor, getTypeIcon} from './AttractionCard';
import {BOOKMARK_PIN_COLORS} from '../../helpers/mockCoordinates';
import {BookmarkTab} from './BookmarkSheetHeader';

interface BookmarkListItemProps {
    item: any;
    index: number;
    activeTab: BookmarkTab;
    selectedId: number | null;
    onPress: (item: any) => void;
}

export function BookmarkListItem({item, index, activeTab, selectedId, onPress}: BookmarkListItemProps) {
    if (activeTab === 'bookmarks') {
        const pinColor = BOOKMARK_PIN_COLORS[index % BOOKMARK_PIN_COLORS.length];
        const count = Number(item.attraction_count ?? 0);
        return (
            <MinimalCard
                title={item.title}
                subtitle={`${count} attraction${count !== 1 ? 's' : ''}`}
                pinColor={pinColor}
                isSelected={selectedId === item.id}
                visited={!!item.visited}
                onPress={() => onPress(item)}
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
            onPress={() => onPress(item)}
        />
    );
}

