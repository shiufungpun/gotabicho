import {BookmarkSource, ExtractedBookmarkData} from '../../types';
import {extractMetadata} from './base_handler';

/**
 * Extract metadata from Instagram URLs
 * Handles formats like:
 * - https://www.instagram.com/p/[post-id]/
 * - https://www.instagram.com/reel/[reel-id]/
 */
export async function extractInstagramMetadata(url: string): Promise<ExtractedBookmarkData> {
    console.log('[InstagramHandler] Processing Instagram URL:', url);

    try {
        // Use base handler to extract Open Graph metadata
        const data = await extractMetadata(url, BookmarkSource.Instagram);

        console.log('[InstagramHandler] Extracted data:', data);

        return data;
    } catch (error) {
        console.error('[InstagramHandler] Error extracting Instagram metadata:', error);

        // Fallback
        return {
            title: 'Instagram Post',
            description: null,
            url,
            source: BookmarkSource.Instagram,
            imageUrl: null,
        };
    }
}

