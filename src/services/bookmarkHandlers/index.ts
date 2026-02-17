import {BookmarkSource, detectBookmarkSource, ExtractedBookmarkData} from '../../types';
import {extractInstagramMetadata} from './instagram_handler';
import {extractThreadsMetadata} from './threads_handler';
import {extractMetadata} from './base_handler';

/**
 * Main entry point for bookmark metadata extraction
 * Routes to appropriate handler based on URL source
 */
export async function extractBookmarkMetadata(url: string): Promise<ExtractedBookmarkData> {
    const source = detectBookmarkSource(url);

    console.log('[BookmarkHandler] Detected source:', source, 'for URL:', url);

    switch (source) {
        case BookmarkSource.Instagram:
            return await extractInstagramMetadata(url);

        case BookmarkSource.Threads:
            return await extractThreadsMetadata(url);

        case BookmarkSource.Other:
        default:
            return await extractMetadata(url, BookmarkSource.Other);
    }
}

export {extractInstagramMetadata} from './instagram_handler';
export {extractThreadsMetadata} from './threads_handler';
export {extractMetadata} from './base_handler';

