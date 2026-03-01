/**
 * Shared helpers for attraction types.
 * Import from here instead of AttractionCard to avoid circular deps.
 */

export const ATTRACTION_TYPE_KEYS = ['sight', 'restaurant', 'shopping', 'play', 'hotel'] as const;
export type AttractionType = typeof ATTRACTION_TYPE_KEYS[number];

/** Chinese labels for each attraction type (used in filter chips, group headers, etc.) */
export const ATTRACTION_TYPE_LABELS: Record<string, string> = {
    sight: '景點',
    restaurant: '餐廳',
    shopping: '購物',
    play: '娛樂',
    hotel: '住宿',
};

/** Ionicons icon name for each attraction type */
export function getTypeIcon(type: string): any {
    switch (type) {
        case 'sight':
            return 'eye';
        case 'restaurant':
            return 'restaurant';
        case 'shopping':
            return 'bag';
        case 'play':
            return 'game-controller';
        case 'hotel':
            return 'bed';
        default:
            return 'location';
    }
}

/** Hex colour for each attraction type */
export function getTypeColor(type: string): string {
    switch (type) {
        case 'sight':
            return '#3B82F6';
        case 'restaurant':
            return '#F97316';
        case 'shopping':
            return '#A855F7';
        case 'play':
            return '#22C55E';
        case 'hotel':
            return '#EC4899';
        default:
            return '#6B7280';
    }
}

/** NativeWind bg class for each attraction type (for use with className) */
export function getTypeColorClass(type: string): string {
    switch (type) {
        case 'sight':
            return 'bg-blue-500';
        case 'restaurant':
            return 'bg-orange-500';
        case 'shopping':
            return 'bg-purple-500';
        case 'play':
            return 'bg-green-500';
        case 'hotel':
            return 'bg-pink-500';
        default:
            return 'bg-gray-500';
    }
}


