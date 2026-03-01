import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
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
            style={({pressed}) => [
                styles.card,
                {
                    backgroundColor: isSelected ? colors.primaryLight : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 1.5 : 1,
                    opacity: pressed ? 0.85 : 1,
                },
            ]}
        >
            {/* Left: type icon in colored circle */}
            <View style={[styles.iconCircle, {backgroundColor: typeColor}]}>
                <Ionicons
                    name={getTypeIcon(attraction.type) as any}
                    size={14}
                    color="#fff"
                />
            </View>

            {/* Center: title + location + parent bookmark */}
            <View style={styles.content}>
                <ThemedText numberOfLines={1} style={[styles.title, {color: colors.text}]}>
                    {attraction.title}
                </ThemedText>

                {/* Location row */}
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={11} color={colors.textTertiary}/>
                    <ThemedText numberOfLines={1} style={[styles.meta, {color: colors.textTertiary}]}>
                        {attraction.location ?? ''}
                    </ThemedText>
                </View>

                {/* Parent bookmark row */}
                <View style={styles.row}>
                    <Ionicons name="bookmark-outline" size={11} color={colors.textTertiary}/>
                    <ThemedText numberOfLines={1} style={[styles.meta, {color: colors.textTertiary}]}>
                        {attraction.bookmark_title}
                    </ThemedText>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
        marginVertical: 4,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 3,
        shadowOffset: {width: 0, height: 1},
        elevation: 1,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        flexShrink: 0,
    },
    content: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    meta: {
        fontSize: 12,
        flex: 1,
    },
});

