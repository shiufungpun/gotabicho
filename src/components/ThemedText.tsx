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
}

/**
 * A Text component that automatically adapts its color based on the current theme
 */
export function ThemedText({style, variant = 'primary', ...props}: ThemedTextProps) {
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

    return (
        <Text
            style={[{color}, style]}
            {...props}
        />
    );
}
