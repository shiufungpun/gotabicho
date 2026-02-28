import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

type ExtractionStatus = 'queued' | 'processing' | 'completed' | 'failed';

interface ExtractionStatusBannerProps {
    status: ExtractionStatus;
    error?: string | null;
}

/**
 * Displays an AI-extraction status banner.
 * - 'queued' / 'processing' → purple processing banner
 * - 'failed'                → red error banner
 * - 'completed'             → renders nothing
 */
export function ExtractionStatusBanner({status, error}: ExtractionStatusBannerProps) {
    if (status === 'completed') {
        return null;
    }

    if (status === 'failed') {
        return (
            <View className="mx-4 mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <View className="flex-row items-start">
                    <Ionicons name="alert-circle" size={20} color="#DC2626"/>
                    <View className="ml-3 flex-1">
                        <Text className="text-red-800 font-semibold">Extraction Failed</Text>
                        <Text className="text-red-600 text-xs mt-1">
                            {error || 'An error occurred during extraction'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    // queued or processing
    return (
        <View className="mx-4 mb-4 bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <ActivityIndicator size="small" color="#7C3AED"/>
                    <View className="ml-3 flex-1">
                        <Text className="text-purple-800 font-semibold">
                            {status === 'queued' ? 'Queued for extraction...' : 'Extracting attractions...'}
                        </Text>
                        <Text className="text-purple-600 text-xs mt-1">
                            AI is analyzing the content
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

