import React, {useState} from 'react';
import {ActivityIndicator, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {generateText} from 'ai';
import {apple} from '@react-native-ai/apple';
import {bookmarkPrompt} from '../../prompts/bookmark';
import {parseAiJsonResponse} from '../../../utils/parseAiResponse';

interface AIExtractionSectionProps {
    content: string;
    onExtractionComplete?: (data: any) => void;
}

export default function AIExtractionSection({content, onExtractionComplete}: AIExtractionSectionProps) {
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [extractionError, setExtractionError] = useState('');

    const extractDataWithAI = async () => {
        console.log('[AIExtraction] Starting AI extraction...');
        setIsExtracting(true);
        setExtractionError('');
        setExtractedData(null);

        try {
            if (!content) {
                setExtractionError('No content available to extract');
                return;
            }

            console.log('[AIExtraction] Extracting from content:', content);

            const result = await generateText({
                prompt: `${bookmarkPrompt}\n${content}`,
                model: apple(),
            });

            console.log('[AIExtraction] AI Response:', result.text);

            try {
                const parsed = parseAiJsonResponse(result.text);
                setExtractedData(parsed);
                console.log('[AIExtraction] Parsed data:', parsed);
                onExtractionComplete?.(parsed);
            } catch (parseError) {
                console.error('[AIExtraction] Failed to parse JSON:', parseError);
                setExtractionError(`Failed to parse response: ${result.text}`);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setExtractionError(errorMsg);
            console.error('[AIExtraction] Error:', err);
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <View className="m-4">
            <Text className="text-base font-bold text-gray-800 mb-3">
                🤖 AI Data Extraction Test
            </Text>

            <TouchableOpacity
                onPress={extractDataWithAI}
                disabled={isExtracting}
                className={`bg-purple-600 p-4 rounded-xl flex-row items-center justify-center ${
                    isExtracting ? 'opacity-50' : ''
                }`}>
                {isExtracting ? (
                    <>
                        <ActivityIndicator color="white" size="small"/>
                        <Text className="text-white font-semibold ml-2">Extracting...</Text>
                    </>
                ) : (
                    <>
                        <Ionicons name="sparkles" size={20} color="white"/>
                        <Text className="text-white font-semibold ml-2">
                            Extract Data with AI
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Extraction Error */}
            {extractionError && (
                <View className="mt-3 bg-red-50 p-4 rounded-xl border border-red-200">
                    <View className="flex-row items-start">
                        <Ionicons name="alert-circle" size={20} color="#DC2626"/>
                        <View className="flex-1 ml-2">
                            <Text className="text-red-600 font-semibold mb-1">
                                Extraction Failed
                            </Text>
                            <Text className="text-red-500 text-sm">
                                {extractionError}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Extracted Data Display */}
            {extractedData && (
                <View className="mt-3 bg-green-50 p-4 rounded-xl border border-green-200">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="checkmark-circle" size={20} color="#16A34A"/>
                        <Text className="text-green-700 font-semibold ml-2">
                            Extraction Successful ✨
                        </Text>
                    </View>

                    {extractedData.viewpoints && extractedData.viewpoints.length > 0 ? (
                        extractedData.viewpoints.map((viewpoint: any, index: number) => (
                            <View key={index} className="mb-3 bg-white p-3 rounded-lg">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="location" size={16} color="#7C3AED"/>
                                    <Text className="text-purple-700 font-bold ml-1">
                                        {viewpoint.location}
                                    </Text>
                                </View>

                                {viewpoint.keyPoints && viewpoint.keyPoints.length > 0 && (
                                    <View className="ml-5">
                                        <Text className="text-gray-600 text-xs font-semibold mb-1">
                                            Key Points:
                                        </Text>
                                        {viewpoint.keyPoints.map((point: string, pIndex: number) => (
                                            <View key={pIndex} className="flex-row mb-1">
                                                <Text className="text-gray-500 text-xs mr-2">•</Text>
                                                <Text className="text-gray-700 text-xs flex-1">
                                                    {point}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-600 text-sm">
                            No viewpoints extracted
                        </Text>
                    )}

                    {/* Raw JSON for debugging */}
                    <View className="mt-3 pt-3 border-t border-green-200">
                        <Text className="text-green-700 text-xs font-semibold mb-2">
                            Raw JSON:
                        </Text>
                        <ScrollView
                            horizontal
                            className="bg-gray-800 p-2 rounded"
                            showsHorizontalScrollIndicator={false}
                        >
                            <Text className="text-green-400 text-xs font-mono">
                                {JSON.stringify(extractedData, null, 2)}
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            )}
        </View>
    );
}

