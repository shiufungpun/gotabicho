import React from 'react';
import {GlassContainer, GlassView} from "expo-glass-effect";
import {StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';

interface GlassButtonProps {
    icon: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
    isAbsolute?: boolean;
    top?: string | number;
    left?: string | number;
}

export const GlassButton = ({
                                icon,
                                onPress,
                                disabled = false,
                                isAbsolute = false,
                                top = "85%",
                                left = "75%",
                            }: GlassButtonProps) => {
    let additionalStyles: ViewStyle = {};
    if (isAbsolute) {
        additionalStyles = {position: 'absolute', top: top as any, left: left as any};
    }
    return (
        <GlassContainer spacing={10} style={[styles.glassContainerStyle, additionalStyles]}>
            <TouchableOpacity onPress={onPress} disabled={disabled}>
                <GlassView style={styles.glassButton} isInteractive>
                    {icon}
                </GlassView>
            </TouchableOpacity>
        </GlassContainer>
    );
};


const styles = StyleSheet.create({
    glassContainerStyle: {
        width: 250,
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        zIndex: 1000, // Ensure it appears above other content
    },
    glassButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    }
});