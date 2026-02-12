import '../global.css';
import {useFonts, YujiSyuku_400Regular} from '@expo-google-fonts/yuji-syuku';
import {HinaMincho_400Regular} from '@expo-google-fonts/hina-mincho';
import {Iansui_400Regular} from '@expo-google-fonts/iansui';
import {ThemedText, ThemedView} from '../src/components';
import {Stack} from "expo-router";
import {AppProvider, useDatabaseContext, useThemeContext} from "../src/providers";


function StackNavigator() {
    const {colors} = useThemeContext();

    return (
        <Stack screenOptions={{
            headerShown: false, headerStyle: {
                // backgroundColor: colors.background
            },
        }}>
            <Stack.Screen name="index" options={{headerShown: false}}/>
            <Stack.Screen name="add-trip" options={{
                presentation: "formSheet"
            }}/>
            <Stack.Screen
                name="trip/[id]"
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
                name="add-receipt"
                options={{
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="receipt/[id]"
                options={{
                    title: 'Receipt Details',
                    headerShown: true,
                }}
            />
        </Stack>
    );
}

function AppContent() {
    const {isReady} = useDatabaseContext();
    const [fontsLoaded] = useFonts({
        YujiSyuku_400Regular,
        HinaMincho_400Regular,
        Iansui_400Regular,
    });

    if (!isReady || !fontsLoaded) {
        return (
            <ThemedView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ThemedText>Initializing Database...</ThemedText>
            </ThemedView>
        );
    }

    return <StackNavigator/>;
}

export default function RootLayout() {
    return (
        <AppProvider>
            <AppContent/>
        </AppProvider>
    );
}

