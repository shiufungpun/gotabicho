import React from 'react';
import {GlassContainer, GlassView} from "expo-glass-effect";
import {StyleSheet, TouchableOpacity} from 'react-native';
import {PlusIcon} from "lucide-react-native";
import {useTheme} from "../../theme";
import {useRouter} from "expo-router";

const AddTripButton = () => {
    const {colors} = useTheme();
    const router = useRouter();
    return (
        <GlassContainer spacing={10} style={styles.glassContainerStyle}>
            <TouchableOpacity onPress={() => {
                router.navigate(`/add-trip`)
            }}>
                <GlassView style={styles.glassButton} isInteractive>
                    <PlusIcon size={30} color={colors.textSecondary}/>
                </GlassView>
            </TouchableOpacity>
        </GlassContainer>
    );
};

export default AddTripButton;


const styles = StyleSheet.create({
    glassContainerStyle: {
        position: 'absolute',
        top: "85%",
        left: "75%",
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
    }
});