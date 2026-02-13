import '../global.css';
import {useFonts, YujiSyuku_400Regular} from '@expo-google-fonts/yuji-syuku';
import {HinaMincho_400Regular} from '@expo-google-fonts/hina-mincho';
import {Iansui_400Regular} from '@expo-google-fonts/iansui';
import {ThemedText, ThemedView} from '../src/components';
import {Stack, useRouter} from "expo-router";
import {AppProvider, useDatabaseContext, useThemeContext} from "../src/providers";
import {useEffect} from 'react';
import {useShareIntentHandler} from '../src/hooks/useShareIntent';
import {copySharedFileToAppDirectory} from '../src/helpers/fileHelpers';
import {getActiveTrip} from "../src/repositories/tripRepository";
import {Alert} from "react-native";


function StackNavigator() {
    const {colors} = useThemeContext();
    const router = useRouter();
    const {shareData, clearShareData, hasShareIntent} = useShareIntentHandler();

    // Handle incoming share intents
    useEffect(() => {
        // Only process if we have actual share data
        if (shareData && hasShareIntent) {
            console.log('[StackNavigator] Processing share intent:', shareData);

            const handleShareIntent = async () => {
                try {
                    // Small delay to ensure navigation is ready
                    await new Promise(resolve => setTimeout(resolve, 100));

                    // Get active trip first
                    const activeTrip = await getActiveTrip();

                    if (!activeTrip) {
                        Alert.alert(
                            'No Active Trip',
                            'Please create or select a trip first before adding receipts.',
                            [{text: 'OK'}]
                        );
                        clearShareData();
                        return;
                    }

                    // Process shared image if present
                    if (shareData.files && shareData.files.length > 0) {
                        const firstFile = shareData.files[0];

                        // Copy file to app directory
                        const newPath = await copySharedFileToAppDirectory(firstFile.path, 'receipt');
                        console.log('[StackNavigator] Copied shared file to:', newPath);

                        // Navigate to add-receipt with the image
                        router.push({
                            pathname: '/add-receipt',
                            params: {
                                tripId: activeTrip.id.toString(),
                                sharedImagePath: newPath,
                                sharedText: shareData.text || '',
                                sharedUrl: shareData.webUrl || '',
                            },
                        });
                    } else if (shareData.text || shareData.webUrl) {
                        // Handle text/URL shares
                        router.push({
                            pathname: '/add-receipt',
                            params: {
                                tripId: activeTrip.id.toString(),
                                sharedText: shareData.text || '',
                                sharedUrl: shareData.webUrl || '',
                            },
                        });
                    }

                    // Clear share data after processing
                    clearShareData();
                } catch (error) {
                    console.error('[StackNavigator] Error processing share intent:', error);
                    Alert.alert('Error', 'Failed to process shared content');
                    clearShareData();
                }
            };

            handleShareIntent();
        }
    }, [shareData, hasShareIntent, clearShareData, router]);

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
            <Stack.Screen
                name="+not-found"
                options={{
                    headerShown: false,
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

