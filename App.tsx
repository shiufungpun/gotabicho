import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ActivityIndicator, Text, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {initDatabase} from './src/db/db';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        initDatabase()
            .then(() => {
                console.log('Database initialized');
                setReady(true);
            })
            .catch(e => console.error('DB Init Error:', e));
    }, []);

    if (!ready) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large"/>
                <Text>Initializing Database...</Text>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <AppNavigator/>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
