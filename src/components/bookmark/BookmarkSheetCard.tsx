import React from 'react';
import {Image, Pressable, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ThemedText} from '../index';
import {useTheme} from '../../theme';
import {BookmarkWithCount} from '../../repositories/bookmarkRepository';
import {getSourceIcon} from '../../helpers/bookmarkHelpers';

interface BookmarkSheetCardProps {
    bookmark: BookmarkWithCount;
    isChecked?: boolean;
    onPress: (bookmark: BookmarkWithCount) => void;
    onToggleCheck?: (bookmark: BookmarkWithCount) => void;
}

const THUMBNAIL_SIZE = 52;
const THUMBNAIL_RADIUS = 10;

export function BookmarkSheetCard({
                                      bookmark,
                                      isChecked = false,
                                      onPress,
                                      onToggleCheck,
                                  }: BookmarkSheetCardProps) {
    const {colors} = useTheme();
    const count = Number(bookmark.attraction_count ?? 0);

    return (
        <Pressable
            onPress={() => onPress(bookmark)}
            className="flex-row items-center mx-3 my-1 px-3 py-2.5 rounded-2xl"
            style={({pressed}) => ({
                backgroundColor: isChecked ? colors.primaryLight : colors.card,
                borderWidth: isChecked ? 1.5 : 0,
                borderColor: isChecked ? colors.primary : undefined,
                opacity: pressed ? 0.82 : 1,
            })}
        >
            {/* ── Selection checkbox (always visible) ───────────────────── */}
            <TouchableOpacity
                onPress={() => onToggleCheck?.(bookmark)}
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

            {/* ── Thumbnail ──────────────────────────────────────────────── */}
            {bookmark.thumbnail_url ? (
                <Image
                    source={{uri: bookmark.thumbnail_url}}
                    style={{
                        width: THUMBNAIL_SIZE,
                        height: THUMBNAIL_SIZE,
                        borderRadius: THUMBNAIL_RADIUS,
                        marginRight: 12
                    }}
                    resizeMode="cover"
                />
            ) : (
                <View
                    style={{
                        width: THUMBNAIL_SIZE,
                        height: THUMBNAIL_SIZE,
                        borderRadius: THUMBNAIL_RADIUS,
                        marginRight: 12,
                        backgroundColor: colors.divider,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name="image-outline" size={22} color={colors.textTertiary}/>
                </View>
            )}

            {/* ── Text block ─────────────────────────────────────────────── */}
            <View className="flex-1 justify-center mr-2">
                <ThemedText numberOfLines={2} variant="primary" textStyle="body">
                    {bookmark.title}
                </ThemedText>

                <View className="flex-row items-center mt-1 gap-x-2">
                    <View className="flex-row items-center rounded-full px-2 py-[3px] gap-x-1"
                          style={{backgroundColor: colors.divider}}>
                        <Ionicons name={getSourceIcon(bookmark.source) as any} size={11} color={colors.textSecondary}/>
                        <ThemedText variant="tertiary"
                                    style={{fontSize: 11, fontWeight: '500', textTransform: 'capitalize'}}>
                            {bookmark.source ?? 'other'}
                        </ThemedText>
                    </View>

                    <View className="flex-row items-center rounded-full px-2 py-[3px] gap-x-1"
                          style={{backgroundColor: colors.divider}}>
                        <Ionicons name="location-outline" size={11} color={colors.textTertiary}/>
                        <ThemedText variant="tertiary" style={{fontSize: 11, fontWeight: '500'}}>
                            {count} attraction{count !== 1 ? 's' : ''}
                        </ThemedText>
                    </View>
                </View>
            </View>

            {/* ── Chevron ────────────────────────────────────────────────── */}
            <Ionicons name="chevron-forward" size={14} color={colors.textTertiary}/>
        </Pressable>
    );
}
