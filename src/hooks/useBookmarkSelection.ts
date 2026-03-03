import {useCallback, useState} from 'react';
import {BookmarkTab} from '../components';

export function useBookmarkSelection(activeTab: BookmarkTab) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // When tab changes externally, clear the selection
    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const isSelecting = selectedIds.size > 0;

    return {
        isSelecting,
        selectedIds,
        selectionTab: activeTab,
        toggleSelect,
        clearSelection,
    };
}
