import {useCallback, useEffect, useState} from 'react';
import {
    AttractionWithBookmark,
    BookmarkWithCount,
    getAllAttractions,
    getAllBookmarks,
    updateAttractionVisited,
    updateBookmarkVisited,
} from '../repositories/bookmarkRepository';
import {dataChangeEmitter} from '../services/dataEventEmitter';

export const useBookmarks = () => {
    const [bookmarks, setBookmarks] = useState<BookmarkWithCount[]>([]);
    const [attractions, setAttractions] = useState<AttractionWithBookmark[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [bms, attrs] = await Promise.all([getAllBookmarks(), getAllAttractions()]);
            setBookmarks(bms);
            setAttractions(attrs);
        } catch (e) {
            console.error('[useBookmarks] Error loading:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        const unsubscribe = dataChangeEmitter.subscribe(() => {
            load();
        });
        return () => unsubscribe();
    }, [load]);

    const toggleBookmarkVisited = useCallback(async (id: number, current: boolean) => {
        await updateBookmarkVisited(id, !current);
        setBookmarks(prev =>
            prev.map(b => (b.id === id ? {...b, visited: !current} : b))
        );
    }, []);

    const toggleAttractionVisited = useCallback(async (id: number, current: boolean) => {
        await updateAttractionVisited(id, !current);
        setAttractions(prev =>
            prev.map(a => (a.id === id ? {...a, visited: !current} : a))
        );
    }, []);

    return {bookmarks, attractions, loading, refresh: load, toggleBookmarkVisited, toggleAttractionVisited};
};

