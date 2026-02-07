import React from 'react';
import {Text, TextStyle, TouchableOpacity, ViewStyle} from 'react-native';
import {useTheme} from "../../theme";

interface ButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
    style?: ViewStyle;
    textStyle?: TextStyle;
}

/**
 * A standard button component with themed styling
 */
export const Button: React.FC<ButtonProps> = ({
                                                  title,
                                                  onPress,
                                                  disabled = false,
                                                  variant = 'primary',
                                                  style,
                                                  textStyle
                                              }) => {
    const {colors} = useTheme();

    const backgroundColor = variant === 'primary' ? colors.primary : colors.surface;
    const textColor = variant === 'primary' ? '#ffffff' : colors.text;

    return (
        <TouchableOpacity
            className={`py-3.5 px-6 rounded-xl items-center justify-center min-h-[50px] ${disabled ? 'opacity-50' : ''}`}
            style={[
                {backgroundColor},
                style
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <Text
                className="text-base font-semibold"
                style={[{color: textColor}, textStyle]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};
