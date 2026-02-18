import React, {useState} from 'react';
import {ActivityIndicator, ScrollView, TextInput, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {ThemedText, ThemedView} from '../src/components';
import {useTheme} from '../src/theme';
import {generateText} from 'ai';
import {apple} from '@react-native-ai/apple';

export default function AITestScreen() {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const insets = useSafeAreaInsets();
    const {colors} = useTheme();
    const router = useRouter();

    const testAI = async () => {
        if (!input.trim()) {
            setError('Please enter some text');
            return;
        }

        setLoading(true);
        setError('');
        setResponse('');

        try {
            // Test basic text generation
            const result = await generateText({
                prompt: input,
                model: apple(),
            });

            setResponse(result.text || 'No response received');
        } catch (err) {
            setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            console.error('AI Test Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const testAvailability = async () => {
        setLoading(true);
        setError('');
        setResponse('');

        try {
            const available = apple.isAvailable();
            setResponse(`Apple Intelligence is ${available ? 'available ✅' : 'not available ❌'}`);
        } catch (err) {
            setError(`Error checking availability: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView className="flex-1">
            <View
                style={{
                    paddingTop: insets.top + 16,
                    paddingHorizontal: 16,
                    backgroundColor: colors.surface,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                }}
            >
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ThemedText variant="primary" className="text-xl">←</ThemedText>
                    </TouchableOpacity>
                    <ThemedText variant="primary" className="text-2xl font-bold">
                        AI Test
                    </ThemedText>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{padding: 16}}
            >
                <ThemedText variant="secondary" className="mb-4">
                    Test react-native-ai/apple integration
                </ThemedText>

                <TouchableOpacity
                    onPress={testAvailability}
                    disabled={loading}
                    style={{
                        backgroundColor: colors.primary,
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    <ThemedText className="text-center text-white font-semibold">
                        Check Availability
                    </ThemedText>
                </TouchableOpacity>

                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: 12,
                        marginBottom: 16,
                    }}
                >
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Enter a prompt to test AI..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={4}
                        style={{
                            color: colors.text,
                            fontSize: 16,
                            minHeight: 80,
                        }}
                    />
                </View>

                <TouchableOpacity
                    onPress={testAI}
                    disabled={loading}
                    style={{
                        backgroundColor: colors.accent,
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    <ThemedText className="text-center text-white font-semibold">
                        {loading ? 'Processing...' : 'Test AI Generation'}
                    </ThemedText>
                </TouchableOpacity>

                {loading && (
                    <View className="items-center py-4">
                        <ActivityIndicator size="large" color={colors.primary}/>
                    </View>
                )}

                {error ? (
                    <View
                        style={{
                            backgroundColor: '#fee',
                            padding: 12,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#fcc',
                        }}
                    >
                        <ThemedText style={{color: '#c00'}}>{error}</ThemedText>
                    </View>
                ) : null}

                {response ? (
                    <View
                        style={{
                            backgroundColor: colors.surface,
                            padding: 12,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: colors.border,
                            marginTop: 16,
                        }}
                    >
                        <ThemedText variant="secondary" className="mb-2 font-semibold">
                            Response:
                        </ThemedText>
                        <ThemedText variant="primary">{response}</ThemedText>
                    </View>
                ) : null}
            </ScrollView>
        </ThemedView>
    );
}

