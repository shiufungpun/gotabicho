import '../global.css';
import {useEffect, useState} from 'react';
import {ActivityIndicator, useColorScheme} from 'react-native';
import {useFonts, YujiSyuku_400Regular} from '@expo-google-fonts/yuji-syuku';
import {HinaMincho_400Regular} from '@expo-google-fonts/hina-mincho';
import {Iansui_400Regular} from '@expo-google-fonts/iansui';
import {initDatabase} from '../src/db/db';
import {ThemedText, ThemedView} from '../src/components';
import {Stack} from "expo-router";

export default function RootLayout() {
    const [ready, setReady] = useState(false);
    const colorScheme = useColorScheme();
    const [fontsLoaded] = useFonts({
        YujiSyuku_400Regular,
        HinaMincho_400Regular,
        Iansui_400Regular,
    });

    useEffect(() => {
        initDatabase()
            .then(() => {
                console.log('Database initialized');
                setReady(true);
            })
            .catch(e => console.error('DB Init Error:', e));
    }, []);

    if (!ready || !fontsLoaded) {
        return (
            <ThemedView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large"/>
                <ThemedText>Initializing Database...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <Stack>
            <Stack.Screen name="index" options={{headerShown: false}}/>
            <Stack.Screen name="add-trip" options={{
                presentation: "formSheet", headerShown: false,
            }}/>
            <Stack.Screen
                name="trip/[id]"
                options={{
                    headerShown: true,
                    title: 'Trip Details'
                }}
            />
            <Stack.Screen
                name="add-receipt"
                options={{
                    presentation: 'modal',
                    title: 'Add Receipt'
                }}
            />
            <Stack.Screen
                name="receipt/[id]"
                options={{title: 'Receipt Details'}}
            />
        </Stack>
    );
}
