import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {HeaderBackButton} from '@react-navigation/elements';
import {getSourceBadgeClass, getSourceIcon} from '../../helpers/bookmarkHelpers';

interface BookmarkHeroHeaderProps {
    thumbnailUrl?: string | null;
    source?: string | null;
    visited?: boolean;
    onToggleVisited?: () => void;
    onBack?: () => void;
    onDelete?: () => void;
    /** Safe-area top inset so the back button clears the status bar */
    topInset?: number;
}

/**
 * Full-width h-48 hero header for the Bookmark Detail screen.
 *
 * Layout (all layers stacked):
 *  1. Thumbnail image / placeholder fills the entire 192 px area
 *  2. LinearGradient overlay: transparent → rgba(0,0,0,0.55), pointing upward
 *     from the bottom (creates the bottom shadow effect)
 *  3. Source badge – absolute, bottom-left
 *  4. Visited toggle – absolute, bottom-right
 *  5. HeaderBackButton – absolute, top-left (respects safe-area inset)
 */
export function BookmarkHeroHeader({
                                       thumbnailUrl,
                                       source,
                                       visited,
                                       onToggleVisited,
                                       onBack,
                                       onDelete,
                                       topInset = 0,
                                   }: BookmarkHeroHeaderProps) {
    const showVisitedToggle = onToggleVisited !== undefined;

    return (
        <View className="w-full h-72 overflow-hidden bg-gray-200">
            {/* ── 1. Thumbnail / Placeholder ─────────────────────────── */}
            {thumbnailUrl ? (
                <Image
                    source={{uri: thumbnailUrl}}
                    className="absolute inset-0 w-full h-full"
                    resizeMode="cover"
                />
            ) : (
                <View className="absolute inset-0 w-full h-full bg-gray-200 items-center justify-center">
                    <Ionicons name="image-outline" size={64} color="#9CA3AF"/>
                </View>
            )}

            {/* ── 2a. Top gradient (dark → transparent) for status bar ── */}
            <LinearGradient
                colors={['rgba(0,0,0,0.45)', 'transparent']}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                style={{position: 'absolute', top: 0, left: 0, right: 0, height: 96}}
            />

            {/* ── 2b. Bottom gradient shadow (transparent → dark, upward) ── */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.55)']}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 120}}
            />

            {/* ── 3. Source badge – bottom-left ──────────────────────── */}
            {source && (
                <View
                    className={`absolute bottom-3 left-3 ${getSourceBadgeClass(source)} px-3 py-1 rounded-full flex-row items-center`}
                    // Slight frosted tint so badge is readable even without gradient
                    style={{opacity: 0.95}}
                >
                    <Ionicons
                        name={getSourceIcon(source) as any}
                        size={13}
                        color="white"
                    />
                    <Text className="text-white text-xs font-semibold ml-1 capitalize">
                        {source}
                    </Text>
                </View>
            )}

            {/* ── 4. Visited toggle – bottom-right ───────────────────── */}
            {showVisitedToggle && (
                <TouchableOpacity
                    onPress={onToggleVisited}
                    activeOpacity={0.8}
                    className={`absolute bottom-3 right-3 flex-row items-center px-3 py-1 rounded-full border-2 ${
                        visited
                            ? 'bg-green-500 border-green-500'
                            // White-bordered pill with semi-transparent bg for unvisited state
                            : 'border-white/70'
                    }`}
                    style={visited ? undefined : {backgroundColor: 'rgba(0,0,0,0.30)'}}
                >
                    <Ionicons
                        name={visited ? 'checkmark-circle' : 'ellipse-outline'}
                        size={14}
                        color="white"
                    />
                    <Text className="text-white text-xs font-semibold ml-1">
                        {visited ? 'Visited' : 'Mark visited'}
                    </Text>
                </TouchableOpacity>
            )}

            {/* ── 5. Back button – top-left (over image) ─────────────── */}
            {onBack && (
                <View
                    style={{
                        position: 'absolute',
                        top: topInset + 4,
                        left: 10,
                    }}
                >
                    <HeaderBackButton
                        onPress={onBack}
                        tintColor="white"
                    />
                </View>
            )}

            {/* ── 6. Delete button – top-right (over image) ──────────── */}
            {onDelete && (
                <TouchableOpacity
                    onPress={onDelete}
                    activeOpacity={0.8}
                    style={{
                        position: 'absolute',
                        top: topInset + 5,
                        right: 14,
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name="trash-outline" size={24} color="red"/>
                </TouchableOpacity>
            )}
        </View>
    );
}

