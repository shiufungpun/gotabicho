import {useEffect, useState} from 'react';
import {useShareIntent} from 'expo-share-intent';

export interface ShareIntentFile {
    path: string;
    mimeType: string;
    fileName: string;
    width?: number;
    height?: number;
}

export interface ShareIntentData {
    files: ShareIntentFile[];
    text?: string;
    webUrl?: string;
}

/**
 * Hook to handle incoming share intents from other apps
 * Returns shared data (images, text, URLs) when the app is opened via share action
 */
export function useShareIntentHandler() {
    const {hasShareIntent, shareIntent, resetShareIntent, error} = useShareIntent({
        debug: true,
        resetOnBackground: false,
    });

    const [shareData, setShareData] = useState<ShareIntentData | null>(null);

    useEffect(() => {
        if (hasShareIntent && shareIntent) {
            console.log('[ShareIntent] Received share intent:', shareIntent);

            const files: ShareIntentFile[] = [];

            // Process shared media files (images)
            if (shareIntent.files && shareIntent.files.length > 0) {
                shareIntent.files.forEach((file) => {
                    files.push({
                        path: file.path,
                        mimeType: file.mimeType || 'image/jpeg',
                        fileName: file.fileName || 'shared-image.jpg',
                        width: file.width ?? undefined,
                        height: file.height ?? undefined,
                    });
                });
            }

            // Process shared text
            const text = shareIntent.text || undefined;

            // Process shared web URL
            const webUrl = shareIntent.webUrl || undefined;

            if (files.length > 0 || text || webUrl) {
                setShareData({files, text, webUrl});
            }
        }
    }, [hasShareIntent, shareIntent]);

    const clearShareData = () => {
        setShareData(null);
        resetShareIntent();
    };

    return {
        shareData,
        hasShareIntent,
        clearShareData,
        error,
    };
}
