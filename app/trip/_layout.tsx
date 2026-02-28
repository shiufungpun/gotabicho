import {Stack, useRouter} from 'expo-router';
import {useTheme} from '../../src/theme';
import React from "react";
import {HeaderBackButton} from '@react-navigation/elements';

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
                            <HeaderBackButton
                                onPress={() => router.dismissAll()}
                                tintColor={colors.text}
                            />
                        );
                    }
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
