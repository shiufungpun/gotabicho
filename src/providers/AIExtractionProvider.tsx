import React, {createContext, ReactNode, useContext, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {generateText} from 'ai';
import {apple} from '@react-native-ai/apple';
import {bookmarkPrompt} from '../prompts/bookmark';
import {parseAiJsonResponse} from '../../utils/parseAiResponse';
import {saveAttractions, updateBookmarkTitle} from '../repositories/bookmarkRepository';

const QUEUE_STORAGE_KEY = '@extraction_queue';

interface ExtractionQueueItem {
    bookmarkId: number;
    content: string;
}

interface ExtractionStatus {
    bookmarkId: number;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    error?: string;
}

interface AIExtractionContextValue {
    queueExtraction: (bookmarkId: number, content: string) => Promise<void>;
    cancelExtraction: (bookmarkId: number) => void;
    getExtractionStatus: (bookmarkId: number) => ExtractionStatus | null;
    currentProcessing: number | null;
    queueLength: number;
}

const AIExtractionContext = createContext<AIExtractionContextValue | undefined>(undefined);

interface AIExtractionProviderProps {
    children: ReactNode;
}

export function AIExtractionProvider({children}: AIExtractionProviderProps) {
    const [queue, setQueue] = useState<ExtractionQueueItem[]>([]);
    const [currentProcessing, setCurrentProcessing] = useState<number | null>(null);
    const [statusMap, setStatusMap] = useState<Map<number, ExtractionStatus>>(new Map());
    const statusMapRef = useRef<Map<number, ExtractionStatus>>(new Map());
    const isProcessingRef = useRef(false);

    // Load queue from AsyncStorage on mount
    useEffect(() => {
        loadQueue();
    }, []);

    // Save queue to AsyncStorage whenever it changes
    useEffect(() => {
        saveQueue();
    }, [queue]);

    // Process queue when items are added
    useEffect(() => {
        if (queue.length > 0 && !isProcessingRef.current) {
            processNextInQueue();
        }
    }, [queue]);

    const updateStatusMap = (updater: (prev: Map<number, ExtractionStatus>) => Map<number, ExtractionStatus>) => {
        setStatusMap(prev => {
            const newMap = updater(prev);
            statusMapRef.current = newMap;
            return newMap;
        });
    };

    const loadQueue = async () => {
        try {
            const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
            if (stored) {
                const parsedQueue = JSON.parse(stored) as ExtractionQueueItem[];
                console.log('[AIExtraction] Restored queue from storage:', parsedQueue.length, 'items');
                setQueue(parsedQueue);

                // Mark all as queued
                const newStatusMap = new Map<number, ExtractionStatus>();
                parsedQueue.forEach(item => {
                    newStatusMap.set(item.bookmarkId, {
                        bookmarkId: item.bookmarkId,
                        status: 'queued',
                    });
                });
                statusMapRef.current = newStatusMap;
                setStatusMap(newStatusMap);
            }
        } catch (error) {
            console.error('[AIExtraction] Error loading queue:', error);
        }
    };

    const saveQueue = async () => {
        try {
            await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        } catch (error) {
            console.error('[AIExtraction] Error saving queue:', error);
        }
    };

    const queueExtraction = async (bookmarkId: number, content: string) => {
        console.log('[AIExtraction] Queueing extraction for bookmark:', bookmarkId);

        // Check if already in queue
        if (queue.some(item => item.bookmarkId === bookmarkId)) {
            console.log('[AIExtraction] Bookmark already in queue:', bookmarkId);
            return;
        }

        // Add to queue
        setQueue(prev => [...prev, {bookmarkId, content}]);

        // Update status
        updateStatusMap(prev => {
            const newMap = new Map(prev);
            newMap.set(bookmarkId, {bookmarkId, status: 'queued'});
            return newMap;
        });
    };

    const cancelExtraction = (bookmarkId: number) => {
        console.log('[AIExtraction] Cancelling extraction for bookmark:', bookmarkId);

        // Remove from queue
        setQueue(prev => prev.filter(item => item.bookmarkId !== bookmarkId));

        // Update status
        updateStatusMap(prev => {
            const newMap = new Map(prev);
            newMap.delete(bookmarkId);
            return newMap;
        });

        // If currently processing this bookmark, we can't stop it mid-process
        // but we can prevent saving the results
        if (currentProcessing === bookmarkId) {
            console.log('[AIExtraction] Cannot stop processing, but will discard results');
        }
    };

    const getExtractionStatus = (bookmarkId: number): ExtractionStatus | null => {
        return statusMap.get(bookmarkId) || null;
    };

    const processNextInQueue = async () => {
        if (isProcessingRef.current || queue.length === 0) {
            return;
        }

        isProcessingRef.current = true;
        const item = queue[0];

        console.log('[AIExtraction] Processing bookmark:', item.bookmarkId);
        setCurrentProcessing(item.bookmarkId);

        // Update status to processing
        updateStatusMap(prev => {
            const newMap = new Map(prev);
            newMap.set(item.bookmarkId, {bookmarkId: item.bookmarkId, status: 'processing'});
            return newMap;
        });

        try {
            if (!item.content) {
                throw new Error('No content available for extraction');
            }

            console.log('[AIExtraction] Generating AI response...');
            const result = await generateText({
                prompt: `${bookmarkPrompt}\n${item.content}`,
                model: apple(),
            });

            console.log('[AIExtraction] AI Response received:', result.text);

            // Parse response
            const parsed = parseAiJsonResponse(result.text);
            console.log('[AIExtraction] Parsed data:', parsed);

            // Check if extraction was cancelled while processing (use ref to avoid stale closure)
            const currentStatus = statusMapRef.current.get(item.bookmarkId);
            if (!currentStatus || currentStatus.status !== 'processing') {
                console.log('[AIExtraction] Extraction was cancelled, discarding results');
                return;
            }

            // Save attractions to database
            if (parsed.items && Array.isArray(parsed.items)) {
                // Update bookmark title if AI extracted one
                if (parsed.title && typeof parsed.title === 'string') {
                    await updateBookmarkTitle(item.bookmarkId, parsed.title);
                    console.log('[AIExtraction] Updated bookmark title:', parsed.title);
                }

                await saveAttractions(item.bookmarkId, parsed.items);
                console.log('[AIExtraction] Saved', parsed.items.length, 'attractions');
            }

            // Update status to completed
            updateStatusMap(prev => {
                const newMap = new Map(prev);
                newMap.set(item.bookmarkId, {bookmarkId: item.bookmarkId, status: 'completed'});
                return newMap;
            });

            console.log('[AIExtraction] Extraction completed for bookmark:', item.bookmarkId);
        } catch (error) {
            console.error('[AIExtraction] Error processing extraction:', error);

            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            updateStatusMap(prev => {
                const newMap = new Map(prev);
                newMap.set(item.bookmarkId, {
                    bookmarkId: item.bookmarkId,
                    status: 'failed',
                    error: errorMsg,
                });
                return newMap;
            });
        } finally {
            // Remove from queue
            setQueue(prev => prev.slice(1));
            setCurrentProcessing(null);
            isProcessingRef.current = false;

            // Process next item if available
            setTimeout(() => {
                if (queue.length > 1) {
                    processNextInQueue();
                }
            }, 500);
        }
    };

    const value: AIExtractionContextValue = {
        queueExtraction,
        cancelExtraction,
        getExtractionStatus,
        currentProcessing,
        queueLength: queue.length,
    };

    return (
        <AIExtractionContext.Provider value={value}>
            {children}
        </AIExtractionContext.Provider>
    );
}

export function useAIExtraction(): AIExtractionContextValue {
    const context = useContext(AIExtractionContext);

    if (context === undefined) {
        throw new Error('useAIExtraction must be used within an AIExtractionProvider');
    }

    return context;
}

