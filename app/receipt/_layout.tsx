import {Stack} from 'expo-router';
import {useTheme} from '../../src/theme';

export default function ReceiptLayout() {
    const {colors} = useTheme();

    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen
                name="[id]"
                options={{
                    title: 'Receipt Details',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colors.background
                    },
                    headerShadowVisible: false,
                    headerBackTitle: '返回',
                }}
            />
        </Stack>
    );
}
