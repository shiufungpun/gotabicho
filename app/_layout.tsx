import '../global.css';
import {useFonts, YujiSyuku_400Regular} from '@expo-google-fonts/yuji-syuku';
import {HinaMincho_400Regular} from '@expo-google-fonts/hina-mincho';
import {Iansui_400Regular} from '@expo-google-fonts/iansui';
import {ThemedText, ThemedView} from '../src/components';
import {AppProvider, useDatabaseContext} from "../src/providers";
import {ShareIntentHandler} from '../src/components/share_instent/share_intent';
import {Icon, Label, NativeTabs} from "expo-router/unstable-native-tabs";

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
            <NativeTabs>
                <NativeTabs.Trigger name="index">
                    <Label>Home</Label>
                    <Icon sf="house.fill" drawable="custom_android_drawable"/>
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="ai-test">
                    <Icon sf="gear" drawable="custom_settings_drawable"/>
                    <Label>Settings</Label>
                </NativeTabs.Trigger>
            </NativeTabs>
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
