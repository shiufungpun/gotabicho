import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ThemedCard, ThemedText} from '../index';
import {useTheme} from '../../theme';
import {AttractionWithBookmark} from '../../repositories/bookmarkRepository';
import {getTypeColor, getTypeIcon} from '../../helpers/attractionHelpers';

// Re-export so existing imports from this file keep working
export {getTypeColor, getTypeIcon};

interface AttractionCardProps {
    attraction: AttractionWithBookmark;
    onPress: () => void;
    onToggleVisited: () => void;
}


export function AttractionCard({attraction, onPress, onToggleVisited}: AttractionCardProps) {
    const {colors} = useTheme();
    const typeColor = getTypeColor(attraction.type);

    return (
        <TouchableOpacity onPress={onPress} className="mb-3 mx-4">
            <ThemedCard>
                <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                    {/* Type icon */}
                    <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: typeColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                        marginTop: 2,
                        flexShrink: 0,
                    }}>
                        <Ionicons name={getTypeIcon(attraction.type)} size={18} color="white"/>
                    </View>

                    {/* Content */}
                    <View style={{flex: 1}}>
                        <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'}}>
                            <ThemedText textStyle="body" style={{fontWeight: '600', flex: 1, marginRight: 8}}
                                        numberOfLines={2}>
                                {attraction.title}
                            </ThemedText>
                            {/* Visited toggle */}
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onToggleVisited();
                                }}
                                style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 13,
                                    borderWidth: 2,
                                    borderColor: attraction.visited ? colors.success : colors.border,
                                    backgroundColor: attraction.visited ? colors.success : 'transparent',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                {attraction.visited && <Ionicons name="checkmark" size={14} color="white"/>}
                            </TouchableOpacity>
                        </View>

                        {/* Location */}
                        {attraction.location && (
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 3}}>
                                <Ionicons name="location-outline" size={12} color={colors.textTertiary}/>
                                <ThemedText variant="tertiary" style={{fontSize: 12, marginLeft: 3}} numberOfLines={1}>
                                    {attraction.location}
                                </ThemedText>
                            </View>
                        )}

                        {/* Tags */}
                        {attraction.tags && attraction.tags.length > 0 && (
                            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 5, gap: 4}}>
                                {attraction.tags.map((tag, i) => (
                                    <View key={i} style={{
                                        backgroundColor: colors.divider,
                                        borderRadius: 10,
                                        paddingHorizontal: 7,
                                        paddingVertical: 2,
                                    }}>
                                        <ThemedText variant="tertiary" style={{fontSize: 11}}>
                                            {tag}
                                        </ThemedText>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Parent bookmark */}
                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                            <Ionicons name="bookmark-outline" size={11} color={colors.textTertiary}/>
                            <ThemedText variant="tertiary" style={{fontSize: 11, marginLeft: 3}} numberOfLines={1}>
                                {attraction.bookmark_title}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </ThemedCard>
        </TouchableOpacity>
    );
}

