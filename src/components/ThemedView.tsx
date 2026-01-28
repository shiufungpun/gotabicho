import React from 'react';
import {View, ViewProps} from 'react-native';
import {useTheme} from '../theme/useTheme';

interface ThemedViewProps extends ViewProps {
    /**
     * Override the background color variant.
     * - 'background': Main app background (default)
     * - 'surface': Card/surface background
     * - 'card': Card background (same as surface)
     * - 'primary': Primary color background
     * - 'transparent': Transparent background
     */
    variant?: 'background' | 'surface' | 'card' | 'primary' | 'transparent';
}

/**
 * A View component that automatically adapts its background color based on the current theme
 */
export function ThemedView({style, variant = 'background', ...props}: ThemedViewProps) {
    const {colors} = useTheme();

    const backgroundColor = React.useMemo(() => {
        switch (variant) {
            case 'surface':
            case 'card':
                return colors.surface;
            case 'primary':
                return colors.primary;
            case 'transparent':
                return 'transparent';
            case 'background':
            default:
                return colors.background;
        }
    }, [variant, colors]);

    return (
        <View
            style={[{backgroundColor}, style]}
            {...props}
        />
    );
}
