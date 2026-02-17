import {useEffect} from 'react';
import {Alert} from 'react-native';
import {useRouter} from 'expo-router';
import {useShareIntentHandler} from '../../hooks/useShareIntent';
import {copySharedFileToAppDirectory} from '../../helpers/fileHelpers';
import {getActiveTrip} from '../../repositories/tripRepository';

export function ShareIntentHandler() {
    const router = useRouter();
    const {shareData, clearShareData, hasShareIntent} = useShareIntentHandler();

    useEffect(() => {
        // Only process if we have actual share data
        if (shareData && hasShareIntent) {
            console.log('[ShareIntentHandler] Processing share intent:', shareData);

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
                } catch (error) {
                    console.error('[ShareIntentHandler] Error processing share intent:', error);
                    Alert.alert('Error', 'Failed to process shared content');
                    clearShareData();
                }
            };

            handleShareIntent();
        }
    }, [shareData, hasShareIntent, clearShareData, router]);

    // This component doesn't render anything
    return null;
}

