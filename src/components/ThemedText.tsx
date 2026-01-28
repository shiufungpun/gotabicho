import React from 'react';
import {Text, TextProps} from 'react-native';
import {useTheme} from '../theme/useTheme';

interface ThemedTextProps extends TextProps {
    /**
     * Text color variant
     * - 'primary': Primary text color (default)
     * - 'secondary': Secondary/muted text
     * - 'tertiary': Tertiary/very muted text
     * - 'primaryColor': App primary color
     * - 'success': Success color
     * - 'error': Error color
     * - 'warning': Warning color
     */
    variant?: 'primary' | 'secondary' | 'tertiary' | 'primaryColor' | 'success' | 'error' | 'warning';

    /**
     * Text style variant for size and font family
     * - 'header': Large header text (24px, bold)
     * - 'subheader': Medium header text (20px, semi-bold)
     * - 'title': Title text (18px, semi-bold)
     * - 'content': Regular content text (16px, default)
     * - 'body': Body text (14px, regular)
     * - 'caption': Small caption text (12px, regular)
     * - 'placeholder': Placeholder text (14px, italic)
     */
    textStyle?: 'header' | 'subheader' | 'title' | 'content' | 'body' | 'caption' | 'placeholder';
}

/**
 * A Text component that automatically adapts its color based on the current theme
 */
export function ThemedText({style, variant = 'primary', textStyle = 'content', ...props}: ThemedTextProps) {
    const {colors} = useTheme();

    const color = React.useMemo(() => {
        switch (variant) {
            case 'secondary':
                return colors.textSecondary;
            case 'tertiary':
                return colors.textTertiary;
            case 'primaryColor':
                return colors.primary;
            case 'success':
                return colors.success;
            case 'error':
                return colors.error;
            case 'warning':
                return colors.warning;
            case 'primary':
            default:
                return colors.text;
        }
    }, [variant, colors]);

    const typography = React.useMemo(() => {
        switch (textStyle) {
            case 'header':
                return {fontSize: 24, fontWeight: '700' as const, fontFamily: 'YujiSyuku_400Regular'};
            case 'subheader':
                return {fontSize: 20, fontWeight: '600' as const};
            case 'title':
                return {fontSize: 18, fontWeight: '600' as const,};
            case 'content':
                return {fontSize: 16, fontWeight: '400' as const};
            case 'body':
                return {fontSize: 14, fontWeight: '400' as const};
            case 'caption':
                return {fontSize: 12, fontWeight: '400' as const};
            case 'placeholder':
                return {fontSize: 14, fontWeight: '400' as const, fontStyle: 'italic' as const};
            default:
                return {fontSize: 16, fontWeight: '400' as const};
        }
    }, [textStyle]);

    return (
        <Text
            style={[{color}, typography, style]}
            {...props}
        />
    );
}
