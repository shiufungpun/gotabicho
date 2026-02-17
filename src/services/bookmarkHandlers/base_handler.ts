import {BookmarkSource, ExtractedBookmarkData} from '../../types';

/**
 * Fetch URL with timeout
 */
async function fetchWithTimeout(url: string, timeoutMs: number = 5000): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            },
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Extract meta tags from HTML
 */
function extractMetaTags(html: string): Record<string, string> {
    const meta: Record<string, string> = {};

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
        meta.title = titleMatch[1].trim();
    }

    // Extract Open Graph tags
    const ogRegex = /<meta\s+(?:property|name)=["']og:([^"']+)["']\s+content=["']([^"']+)["']/gi;
    let match;
    while ((match = ogRegex.exec(html)) !== null) {
        meta[`og:${match[1]}`] = match[2];
    }

    // Extract Twitter tags
    const twitterRegex = /<meta\s+(?:property|name)=["']twitter:([^"']+)["']\s+content=["']([^"']+)["']/gi;
    while ((match = twitterRegex.exec(html)) !== null) {
        meta[`twitter:${match[1]}`] = match[2];
    }

    // Extract description meta tag
    const descRegex = /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i;
    const descMatch = html.match(descRegex);
    if (descMatch) {
        meta.description = descMatch[1];
    }

    return meta;
}

/**
 * Base handler for extracting bookmark metadata from URLs
 */
export async function extractMetadata(
    url: string,
    source: BookmarkSource
): Promise<ExtractedBookmarkData> {
    console.log(`[BaseHandler] Extracting metadata from ${source}:`, url);

    try {
        const html = await fetchWithTimeout(url, 5000);
        const meta = extractMetaTags(html);

        console.log('[BaseHandler] Extracted meta tags:', meta);

        // Try to get title from Open Graph, Twitter, or HTML title
        const title = meta['og:title'] || meta['twitter:title'] || meta.title || url;

        // Try to get description
        const description = meta['og:description'] || meta['twitter:description'] || meta.description || null;

        // Try to get image
        const imageUrl = meta['og:image'] || meta['twitter:image'] || null;

        return {
            title,
            description,
            url,
            source,
            imageUrl,
        };
    } catch (error) {
        console.error('[BaseHandler] Failed to extract metadata:', error);

        // Fallback to basic URL info
        return {
            title: url,
            description: null,
            url,
            source,
            imageUrl: null,
        };
    }
}

/**
 * Create fallback bookmark data
 */
export function createFallbackData(url: string, source: BookmarkSource): ExtractedBookmarkData {
    return {
        title: url,
        description: null,
        url,
        source,
        imageUrl: null,
    };
}

