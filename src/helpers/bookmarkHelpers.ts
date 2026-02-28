import {BookmarkSource} from '../types';

/**
 * Returns a NativeWind bg class for a given bookmark source.
 */
export function getSourceBadgeClass(source: string | null): string {
    switch (source) {
        case BookmarkSource.Instagram:
            return 'bg-pink-500';
        case BookmarkSource.Threads:
            return 'bg-black';
        default:
            return 'bg-gray-500';
    }
}

/**
 * Returns a hex colour string for a given bookmark source
 * (useful when NativeWind class strings aren't applicable, e.g. in StyleSheet-based components).
 */
export function getSourceBadgeColor(source: string | null): string {
    switch (source) {
        case BookmarkSource.Instagram:
            return '#EC4899';
        case BookmarkSource.Threads:
            return '#000000';
        default:
            return '#6B7280';
    }
}

/**
 * Returns an Ionicons icon name for a given bookmark source.
 */
export function getSourceIcon(source: string | null): string {
    switch (source) {
        case BookmarkSource.Instagram:
            return 'logo-instagram';
        case BookmarkSource.Threads:
            return 'chatbubble-ellipses';
        default:
            return 'link';
    }
}

