import {Stack, useRouter} from 'expo-router';
import {useTheme} from '../../src/theme';
import {TouchableOpacity} from "react-native";
import React from "react";
import {ChevronLeftIcon} from "lucide-react-native";

export default function TripLayout() {
    const {colors} = useTheme()
    const router = useRouter();
    return (
        <Stack screenOptions={{headerShown: true}}>
            <Stack.Screen
                name="[id]"
                options={{
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerShadowVisible: false,
                    headerTintColor: colors.text,
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: '600',
                    },
                    headerLeft: () => {
                        return (
                            <TouchableOpacity className={"pl-1"} onPress={() => {
                                router.back();
                            }}>
                                <ChevronLeftIcon size={24} color={colors.text}/>
                            </TouchableOpacity>
                        );
                    }, // Hide back button on the main trip screen
                }}
            />
            <Stack.Screen
                name="[id]/edit-participants"
                options={{
                    headerShown: true,
                    title: 'Participants',
                    headerStyle: {backgroundColor: colors.background},
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                }}
            />
        </Stack>
    );
}
