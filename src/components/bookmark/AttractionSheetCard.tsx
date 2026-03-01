import React from 'react';
import {Pressable, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ThemedText} from '../index';
import {useTheme} from '../../theme';
import {AttractionWithBookmark} from '../../repositories/bookmarkRepository';
import {getTypeColor, getTypeIcon} from './AttractionCard';

interface AttractionSheetCardProps {
    attraction: AttractionWithBookmark;
    isSelected: boolean;
    onPress: (attraction: AttractionWithBookmark) => void;
}

export function AttractionSheetCard({attraction, isSelected, onPress}: AttractionSheetCardProps) {
    const {colors} = useTheme();
    const typeColor = getTypeColor(attraction.type);

    return (
        <Pressable
            onPress={() => onPress(attraction)}
            className="flex-row items-center mx-3 my-1 px-3 py-2.5"
            style={({pressed}) => ({
                backgroundColor: isSelected ? colors.primaryLight : colors.card,
                borderWidth: isSelected ? 1.5 : 0,
                borderColor: isSelected ? colors.primary : undefined,
                opacity: pressed ? 0.82 : 1,
            })}
        >

            {/* ── Text block ─────────────────────────────────────────────── */}
            <View className="flex-1 justify-center mr-2">
                <ThemedText numberOfLines={2} variant="primary" textStyle="body">
                    {attraction.title}
                </ThemedText>

                {/* Location + parent bookmark pills */}
                {/* Location pill */}
                {attraction.location ? (
                    <View
                        className="flex-row items-center rounded-full py-[3px] gap-x-1"
                    >
                        <Ionicons name="location-outline" size={11} color={colors.textTertiary}/>
                        <ThemedText
                            numberOfLines={1}
                            variant="tertiary"
                            style={{fontSize: 11, fontWeight: '500', flexShrink: 1}}
                        >
                            {attraction.location}
                        </ThemedText>
                    </View>
                ) : null}

                {/* Parent bookmark pill */}
                <View
                    className="flex-row items-center rounded-full py-[3px] gap-x-1"
                >
                    <Ionicons name="bookmark-outline" size={11} color={colors.textTertiary}/>
                    <ThemedText
                        numberOfLines={1}
                        variant="tertiary"
                        style={{fontSize: 11, fontWeight: '500', flexShrink: 1}}
                    >
                        {attraction.bookmark_title}
                    </ThemedText>
                </View>
            </View>

            {/* ── Type icon circle ───────────────────────────────────────── */}
            <View
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: typeColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    flexShrink: 0,
                }}
            >
                <Ionicons
                    name={getTypeIcon(attraction.type) as any}
                    size={16}
                    color="#fff"
                />
            </View>
            {/* ── Chevron ────────────────────────────────────────────────── */}
            <Ionicons name="chevron-forward" size={14} color={colors.textTertiary}/>
        </Pressable>
    );
}


