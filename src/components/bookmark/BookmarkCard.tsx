import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ThemedCard, ThemedText} from '../index';
import {useTheme} from '../../theme';
import {BookmarkWithCount} from '../../repositories/bookmarkRepository';
import {BookmarkSource} from '../../types';

interface BookmarkCardProps {
    bookmark: BookmarkWithCount;
    onPress: () => void;
    onToggleVisited: () => void;
}

function getSourceBadgeColor(source: string | null) {
    switch (source) {
        case BookmarkSource.Instagram:
            return '#EC4899';
        case BookmarkSource.Threads:
            return '#000000';
        default:
            return '#6B7280';
    }
}

function getSourceIcon(source: string | null): any {
    switch (source) {
        case BookmarkSource.Instagram:
            return 'logo-instagram';
        case BookmarkSource.Threads:
            return 'chatbubble-ellipses';
        default:
            return 'link';
    }
}

export function BookmarkCard({bookmark, onPress, onToggleVisited}: BookmarkCardProps) {
    const {colors} = useTheme();
    const badgeColor = getSourceBadgeColor(bookmark.source);

    return (
        <TouchableOpacity onPress={onPress} className="mb-3 mx-4">
            <ThemedCard style={{padding: 0, overflow: 'hidden'}}>
                {/* Thumbnail */}
                {bookmark.thumbnail_url ? (
                    <Image
                        source={{uri: bookmark.thumbnail_url}}
                        style={{width: '100%', height: 140}}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={{
                        width: '100%',
                        height: 90,
                        backgroundColor: colors.divider,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Ionicons name="image-outline" size={40} color={colors.textTertiary}/>
                    </View>
                )}

                <View style={{padding: 12}}>
                    {/* Source badge + visited toggle */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 6
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: badgeColor,
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                        }}>
                            <Ionicons name={getSourceIcon(bookmark.source)} size={12} color="white"/>
                            <ThemedText style={{color: 'white', fontSize: 11, fontWeight: '600', marginLeft: 4}}>
                                {bookmark.source ?? 'other'}
                            </ThemedText>
                        </View>

                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onToggleVisited();
                            }}
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                borderWidth: 2,
                                borderColor: bookmark.visited ? colors.success : colors.border,
                                backgroundColor: bookmark.visited ? colors.success : 'transparent',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {bookmark.visited && <Ionicons name="checkmark" size={16} color="white"/>}
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <ThemedText textStyle="body" style={{fontWeight: '600', marginBottom: 4}} numberOfLines={2}>
                        {bookmark.title}
                    </ThemedText>

                    {/* Attraction count */}
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Ionicons name="location-outline" size={13} color={colors.textTertiary}/>
                        <ThemedText variant="tertiary" style={{fontSize: 12, marginLeft: 3}}>
                            {bookmark.attraction_count} attraction{bookmark.attraction_count !== 1 ? 's' : ''}
                        </ThemedText>
                    </View>
                </View>
            </ThemedCard>
        </TouchableOpacity>
    );
}

