import {Stack} from 'expo-router';
import {useTheme} from '../../src/theme';

export default function TripLayout() {
    const {colors} = useTheme();

    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen
                name="[id]"
                options={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colors.background
                    },
                    headerShadowVisible: false,
                    title: '',
                    headerBackTitle: '返回',
                }}
            />
            <Stack.Screen
                name="add"
                options={{
                    presentation: 'formSheet',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
