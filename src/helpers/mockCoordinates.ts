/**
 * Generates deterministic mock coordinates for items that lack real lat/lng.
 * Uses a seeded scatter so pins are stable across re-renders.
 */

// Tokyo city center as the default base
const DEFAULT_BASE = {lat: 35.6762, lng: 139.6503};

// Scatter radius in degrees (~3–5 km radius)
const SCATTER_RADIUS = 0.045;

// Accent colors cycling for bookmark pins (primary, warning, success)
export const BOOKMARK_PIN_COLORS = ['#1565c0', '#F97316', '#22C55E'];

export interface MockCoordinate {
    latitude: number;
    longitude: number;
}

/**
 * Returns a stable mock coordinate for a given item id and index.
 * Uses trigonometric scatter around a base coordinate so pins
 * are spread out and don't overlap at the center.
 */
export function getMockCoordinate(
    id: number,
    index: number,
    base: { lat: number; lng: number } = DEFAULT_BASE,
): MockCoordinate {
    // Use id and index to compute a stable angle and radius
    const angle = (id * 137.508 + index * 42.7) % 360; // golden-angle-like spread
    const radius = SCATTER_RADIUS * (0.4 + (((id * 31 + index * 17) % 60) / 100));

    const angleRad = (angle * Math.PI) / 180;
    return {
        latitude: base.lat + radius * Math.sin(angleRad),
        longitude: base.lng + radius * Math.cos(angleRad),
    };
}
