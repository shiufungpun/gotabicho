import {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, View} from 'react-native';
import {useRouter} from 'expo-router';
import {useShareIntentHandler} from '../../hooks/useShareIntent';
import {copySharedFileToAppDirectory} from '../../helpers/fileHelpers';
import {getActiveTrip} from '../../repositories/tripRepository';
import {extractBookmarkMetadata} from '../../services/bookmarkHandlers';
import {BookmarkSource, detectBookmarkSource} from '../../types';

export function ShareIntentHandler() {
    const router = useRouter();
    const {shareData, clearShareData, hasShareIntent} = useShareIntentHandler();
    const [isProcessing, setIsProcessing] = useState(false);
    const processingRef = useRef(false);

    useEffect(() => {
        // Only process if we have actual share data and not already processing
        if (shareData && hasShareIntent && !processingRef.current) {
            console.log('[ShareIntentHandler] Processing share intent:', shareData);

            const handleShareIntent = async () => {
                // Set processing flag immediately to prevent concurrent processing
                processingRef.current = true;

                try {
                    setIsProcessing(true);

                    // Small delay to ensure navigation is ready
                    await new Promise(resolve => setTimeout(resolve, 100));

                    // Check if this is a bookmark URL share (without images)
                    if (shareData.webUrl && !shareData.files?.length) {
                        console.log('[ShareIntentHandler] Detected URL share, checking for bookmark...');

                        const source = detectBookmarkSource(shareData.webUrl);

                        // If it's a social media URL, treat as bookmark
                        if (source === BookmarkSource.Instagram || source === BookmarkSource.Threads) {
                            console.log('[ShareIntentHandler] Social media URL detected, extracting metadata...');

                            try {
                                const bookmarkData = await extractBookmarkMetadata(shareData.webUrl);

                                console.log('[ShareIntentHandler] Extracted bookmark data:', bookmarkData);

                                // Navigate to add-bookmark screen
                                router.push({
                                    pathname: '/add-bookmark',
                                    params: {
                                        title: bookmarkData.title,
                                        description: bookmarkData.description || '',
                                        url: bookmarkData.url,
                                        source: bookmarkData.source,
                                        imageUrl: bookmarkData.imageUrl || '',
                                    },
                                });

                                clearShareData();
                                setIsProcessing(false);
                                return;
                            } catch (error) {
                                console.error('[ShareIntentHandler] Error extracting bookmark metadata:', error);
                                // Fall through to receipt handling
                            }
                        }
                    }

                    // Original receipt handling flow
                    // Get active trip first
                    const activeTrip = await getActiveTrip();

                    if (!activeTrip) {
                        Alert.alert(
                            'No Active Trip',
                            'Please create or select a trip first before adding receipts.',
                            [{text: 'OK'}]
                        );
                        clearShareData();
                        setIsProcessing(false);
                        processingRef.current = false;
                        return;
                    }

                    // Process shared image if present
                    if (shareData.files && shareData.files.length > 0) {
                        const firstFile = shareData.files[0];

                        // Copy file to app directory
                        const newPath = await copySharedFileToAppDirectory(firstFile.path, 'receipt');
                        console.log('[ShareIntentHandler] Copied shared file to:', newPath);

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
                    setIsProcessing(false);
                    processingRef.current = false;
                } catch (error) {
                    console.error('[ShareIntentHandler] Error processing share intent:', error);
                    Alert.alert('Error', 'Failed to process shared content');
                    clearShareData();
                    setIsProcessing(false);
                    processingRef.current = false;
                }
            };

            handleShareIntent();
        }
    }, [shareData, hasShareIntent, clearShareData, router]);

    // Show loading indicator while processing
    if (isProcessing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6"/>
            </View>
        );
    }

    // This component doesn't render anything when not processing
    return null;
}

const styles = StyleSheet.create({
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
});

