import React from 'react';
import {Pressable, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ThemedText} from '../index';
import {useTheme} from '../../theme';
import {AttractionWithBookmark} from '../../repositories/bookmarkRepository';
import {getTypeColor, getTypeIcon} from '../../helpers/attractionHelpers';

interface AttractionSheetCardProps {
    attraction: AttractionWithBookmark;
    isSelected: boolean;
    isChecked?: boolean;
    onPress: (attraction: AttractionWithBookmark) => void;
    onToggleCheck?: (attraction: AttractionWithBookmark) => void;
}

export function AttractionSheetCard({
                                        attraction,
                                        isSelected,
                                        isChecked = false,
                                        onPress,
                                        onToggleCheck,
                                    }: AttractionSheetCardProps) {
    const {colors} = useTheme();
    const typeColor = getTypeColor(attraction.type);

    return (
        <Pressable
            onPress={() => onPress(attraction)}
            className="flex-row items-center mx-3 my-1 px-3 py-2.5"
            style={({pressed}) => ({
                backgroundColor: isChecked
                    ? colors.primaryLight
                    : isSelected
                        ? colors.primaryLight
                        : colors.card,
                borderWidth: isChecked || isSelected ? 1.5 : 0,
                borderColor: isChecked || isSelected ? colors.primary : undefined,
                borderRadius: 12,
                opacity: pressed ? 0.82 : 1,
            })}
        >
            {/* ── Selection checkbox (always visible) ───────────────────── */}
            <TouchableOpacity
                onPress={() => onToggleCheck?.(attraction)}
                hitSlop={8}
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: isChecked ? colors.primary : colors.border,
                    backgroundColor: isChecked ? colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                    flexShrink: 0,
                }}
            >
                {isChecked && <Ionicons name="checkmark" size={13} color="#fff"/>}
            </TouchableOpacity>

            {/* ── Text block ─────────────────────────────────────────────── */}
            <View className="flex-1 justify-center mr-2 gap-y-2">
                <ThemedText numberOfLines={2} variant="primary" textStyle="body">
                    {attraction.title}
                </ThemedText>

                {/* Location pill */}
                {attraction.location ? (
                    <View className="flex-row items-center rounded-full gap-x-1">
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
                <View className="flex-row items-center rounded-full gap-x-1">
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
                    marginRight: 5,
                }}
            >
                <Ionicons name={getTypeIcon(attraction.type) as any} size={16} color="#fff"/>
            </View>
        </Pressable>
    );
}
