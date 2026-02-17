import {BookmarkSource, ExtractedBookmarkData} from '../../types';
import {extractMetadata} from './base_handler';

/**
 * Extract metadata from Threads URLs
 * Handles formats like:
 * - https://www.threads.net/@[username]/post/[post-id]
 * - https://threads.net/t/[post-id]
 */
export async function extractThreadsMetadata(url: string): Promise<ExtractedBookmarkData> {
    console.log('[ThreadsHandler] Processing Threads URL:', url);

    try {
        // Use base handler to extract Open Graph metadata
        const data = await extractMetadata(url, BookmarkSource.Threads);

        console.log('[ThreadsHandler] Extracted data:', data);

        return data;
    } catch (error) {
        console.error('[ThreadsHandler] Error extracting Threads metadata:', error);

        // Fallback
        return {
            title: 'Threads Post',
            description: null,
            url,
            source: BookmarkSource.Threads,
            imageUrl: null,
        };
    }
}

