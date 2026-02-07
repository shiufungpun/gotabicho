import React from 'react';
import {GlassView} from "expo-glass-effect";
import {TouchableOpacity, ViewStyle} from 'react-native';

interface GlassButtonProps {
    icon: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
    size?: number;
    style?: ViewStyle;
}

/**
 * A glass-effect button component with icon
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
                                                            icon,
                                                            onPress,
                                                            disabled = false,
                                                            size = 50,
                                                            style
                                                        }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <GlassView
                className="justify-center items-center"
                style={[
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        opacity: disabled ? 0.5 : 1
                    },
                    style
                ]}
                isInteractive
            >
                {icon}
            </GlassView>
        </TouchableOpacity>
    );
};
