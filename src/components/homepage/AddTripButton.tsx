import React from 'react';
import {GlassContainer, GlassView} from 'expo-glass-effect';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {PlusIcon} from 'lucide-react-native';
import {useTheme} from '../../theme';

interface AddTripButtonProps {
    onPress: () => void;
}

const AddTripButton = ({onPress}: AddTripButtonProps) => {
    const {colors} = useTheme();
    return (
        <GlassContainer spacing={10} style={styles.glassContainerStyle}>
            <TouchableOpacity onPress={onPress}>
                <GlassView style={styles.glassButton} isInteractive>
                    <PlusIcon size={30} color={colors.text}/>
                </GlassView>
            </TouchableOpacity>
        </GlassContainer>
    );
};

export default AddTripButton;

const styles = StyleSheet.create({
    glassContainerStyle: {
        position: 'absolute',
        top: '88%',
        left: '80%',
        width: 250,
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    glassButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});