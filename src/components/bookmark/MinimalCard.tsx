import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ThemedText} from '../index';
import {useTheme} from '../../theme';

interface MinimalCardProps {
    title: string;
    subtitle: string;
    pinColor: string;
    isSelected: boolean;
    visited: boolean;
    onPress: () => void;
    /** Optional icon name from Ionicons to show instead of the color dot */
    iconName?: string;
}

export function MinimalCard({
                                title,
                                subtitle,
                                pinColor,
                                isSelected,
                                visited,
                                onPress,
                                iconName,
                            }: MinimalCardProps) {
    const {colors} = useTheme();

    return (
        <Pressable
            onPress={onPress}
            style={({pressed}) => [
                styles.card,
                {
                    backgroundColor: isSelected
                        ? colors.primaryLight
                        : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 1.5 : 1,
                    opacity: pressed ? 0.85 : 1,
                },
            ]}
        >
            {/* Left: color dot or type icon */}
            <View style={[styles.dot, {backgroundColor: pinColor}]}>
                {iconName && (
                    <Ionicons name={iconName as any} size={11} color="#fff"/>
                )}
            </View>

            {/* Middle: title + subtitle */}
            <View style={styles.content}>
                <ThemedText
                    numberOfLines={1}
                    style={[styles.title, {color: colors.text}]}
                >
                    {title}
                </ThemedText>
                <ThemedText
                    numberOfLines={1}
                    style={[styles.subtitle, {color: colors.textTertiary}]}
                >
                    {subtitle}
                </ThemedText>
            </View>

            {/* Right: visited indicator */}
            <View style={[
                styles.visitedDot,
                {
                    backgroundColor: visited ? colors.success : 'transparent',
                    borderColor: visited ? colors.success : colors.border,
                    borderWidth: 1.5,
                },
            ]}>
                {visited && <Ionicons name="checkmark" size={9} color="#fff"/>}
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
    dot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        marginRight: 10,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 1,
    },
    visitedDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
