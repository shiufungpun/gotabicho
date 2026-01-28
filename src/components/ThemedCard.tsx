import React from 'react';
import {View, ViewProps} from 'react-native';
import {useTheme} from '../theme/useTheme';

interface ThemedCardProps extends ViewProps {
    /**
     * Whether to show elevation/shadow
     */
    elevated?: boolean;
}

/**
 * A card component with themed background and optional elevation
 */
export function ThemedCard({style, elevated = true, ...props}: ThemedCardProps) {
    const {colors, colorScheme} = useTheme();

    const cardStyle = React.useMemo(() => {
        return {
            backgroundColor: colors.card,
            ...(elevated && {
                elevation: 2,
                shadowColor: colors.shadow,
                shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
                shadowRadius: 4,
                shadowOffset: {width: 0, height: 2},
            }),
        };
    }, [colors, elevated, colorScheme]);

    return (
        <View
            style={[cardStyle, style]}
            {...props}
        />
    );
}
