import './global.css';
import React, {useEffect, useState} from 'react';
import {DarkTheme, DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {ActivityIndicator, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {initDatabase} from './src/db/db';
import AppNavigator from './src/navigation/AppNavigator';
import {ThemedText, ThemedView} from './src/components';

export default function App() {
    const [ready, setReady] = useState(false);
    const colorScheme = useColorScheme();

    useEffect(() => {
        initDatabase()
            .then(() => {
                console.log('Database initialized');
                setReady(true);
            })
            .catch(e => console.error('DB Init Error:', e));
    }, []);

    const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

    if (!ready) {
        return (
            <ThemedView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large"/>
                <ThemedText>Initializing Database...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer theme={navigationTheme}>
                <AppNavigator/>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
