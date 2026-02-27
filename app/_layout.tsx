import '../global.css';
import {useFonts, YujiSyuku_400Regular} from '@expo-google-fonts/yuji-syuku';
import {HinaMincho_400Regular} from '@expo-google-fonts/hina-mincho';
import {Iansui_400Regular} from '@expo-google-fonts/iansui';
import {ThemedText, ThemedView} from '../src/components';
import {AppProvider, useDatabaseContext} from "../src/providers";
import {ShareIntentHandler} from '../src/components/share_instent/share_intent';
import {Stack} from 'expo-router';

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

    return (
        <>
            <ShareIntentHandler/>
            <Stack screenOptions={{headerShown: false}}>
                {/* Main tab group */}
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                {/* Full-screen stack screens outside tabs */}
                <Stack.Screen name="receipt" options={{headerShown: false}}/>
                <Stack.Screen name="trip" options={{headerShown: false}}/>
                <Stack.Screen
                    name="add-receipt"
                    options={{presentation: 'modal', headerShown: false}}
                />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <AppProvider>
            <AppContent/>
        </AppProvider>
    );
}
