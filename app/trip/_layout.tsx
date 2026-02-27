import {Stack} from 'expo-router';
import {useTheme} from '../../src/theme';

export default function TripLayout() {
    const {colors} = useTheme();

    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen
                name="[id]"
                options={{
                    headerStyle: {
                        backgroundColor: colors.background
                    },
                    headerShadowVisible: false,
                }}
            />
        </Stack>
    );
}
