import {Stack} from 'expo-router';
import {useTheme} from '../../src/theme';

export default function TripLayout() {
    const {colors} = useTheme();

    return (
        <Stack screenOptions={{headerShown: true}}>
            <Stack.Screen
                name="[id]"
                options={{
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerShadowVisible: false,
                    headerBackVisible: true
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
