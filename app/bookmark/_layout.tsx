import {Stack} from 'expo-router';

export default function BookmarkLayout() {
    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen
                name="index"
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    presentation: 'formSheet',
                    headerShown: false,
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
