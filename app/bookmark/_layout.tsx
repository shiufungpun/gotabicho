import {Stack} from 'expo-router';
import {useTheme} from '../../src/theme';

export default function BookmarkLayout() {
    const {colors} = useTheme();

    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen
                name="index"
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    presentation: 'card',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colors.background
                    },
                    headerShadowVisible: false,
                    title: 'Bookmark',
                    headerBackTitle: '返回',
                }}
            />
            <Stack.Screen
                name="add"
                options={{
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
