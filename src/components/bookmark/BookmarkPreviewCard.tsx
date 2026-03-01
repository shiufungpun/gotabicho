import React, {useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {getSourceBadgeClass, getSourceIcon} from '../../helpers/bookmarkHelpers';

interface BookmarkPreviewCardProps {
    title?: string | null;
    description?: string | null;
    url?: string | null;
    source?: string | null;
    thumbnailUrl?: string | null;
    /** When provided, show a "Mark visited / Visited" toggle button */
    visited?: boolean;
    onToggleVisited?: () => void;
    /** Whether to show the title (defaults to true) */
    showTitle?: boolean;
    defaultExpanded?: boolean;
}

/**
 * Reusable card that previews a bookmark's thumbnail, source badge,
 * optional visited toggle, title, description and URL.
 *
 * Used in both the Add-Bookmark screen and the Bookmark-Detail screen.
 */
export function BookmarkPreviewCard({
                                        title,
                                        description,
                                        url,
                                        source,
                                        thumbnailUrl,
                                        visited,
                                        onToggleVisited,
                                        showTitle = true,
                                        defaultExpanded = false,
                                    }: BookmarkPreviewCardProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(defaultExpanded);
    const showVisitedToggle = onToggleVisited !== undefined;

    return (
        <View className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Thumbnail */}
            {thumbnailUrl ? (
                <Image
                    source={{uri: thumbnailUrl}}
                    className="w-full h-48"
                    resizeMode="cover"
                />
            ) : (
                <View className="w-full h-48 bg-gray-200 justify-center items-center">
                    <Ionicons name="image-outline" size={64} color="#9CA3AF"/>
                </View>
            )}

            {/* Content */}
            <View className="p-4">
                {/* Source Badge + optional visited toggle */}
                {source && (
                    <View className="flex-row items-center justify-between mb-3">
                        <View
                            className={`${getSourceBadgeClass(source)} px-3 py-1 rounded-full flex-row items-center`}>
                            <Ionicons
                                name={getSourceIcon(source) as any}
                                size={14}
                                color="white"
                            />
                            <Text className="text-white text-xs font-semibold ml-1 capitalize">
                                {source}
                            </Text>
                        </View>

                        {showVisitedToggle && (
                            <TouchableOpacity
                                onPress={onToggleVisited}
                                className={`flex-row items-center px-3 py-1 rounded-full border-2 ${
                                    visited
                                        ? 'bg-green-500 border-green-500'
                                        : 'bg-white border-gray-300'
                                }`}>
                                <Ionicons
                                    name={visited ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={14}
                                    color={visited ? 'white' : '#9CA3AF'}
                                />
                                <Text
                                    className={`text-xs font-semibold ml-1 ${visited ? 'text-white' : 'text-gray-400'}`}>
                                    {visited ? 'Visited' : 'Mark visited'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Title */}
                {showTitle && title && (
                    <Text className="text-xl font-bold text-gray-800 mb-2" numberOfLines={2}>
                        {title}
                    </Text>
                )}

                {/* Description */}
                {description ? (
                    <View className="mb-3">
                        <Text
                            className="text-sm text-gray-600"
                            numberOfLines={isDescriptionExpanded ? undefined : 3}>
                            {description}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setIsDescriptionExpanded(prev => !prev)}
                            className="flex-row items-center mt-1">
                            <Text className="text-xs text-blue-500 font-semibold">
                                {isDescriptionExpanded ? 'Show less' : 'Show more'}
                            </Text>
                            <Ionicons
                                name={isDescriptionExpanded ? 'chevron-up' : 'chevron-down'}
                                size={12}
                                color="#3B82F6"
                            />
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* URL */}
                {url && (
                    <View className="flex-row items-center mt-2">
                        <Ionicons name="link" size={16} color="#9CA3AF"/>
                        <Text className="text-xs text-gray-400 ml-2" numberOfLines={1}>
                            {url}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

