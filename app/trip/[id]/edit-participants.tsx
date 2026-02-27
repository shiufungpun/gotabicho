import React, {useCallback, useEffect, useState} from 'react';
import {Alert, FlatList, KeyboardAvoidingView, Platform} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {getParticipantsByTripId} from '../../../src/repositories/participantRepository';
import {ThemedText, ThemedView} from '../../../src/components';
import {AddParticipantCard, ParticipantRow} from '../../../src/components/trip/settings';
import {Participant} from '../../../src/types';

// ---------- Main screen ----------
export default function EditParticipantsScreen() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const tripId = parseInt(id || '0');

    const [participants, setParticipants] = useState<Participant[]>([]);

    const load = useCallback(async () => {
        try {
            const data = await getParticipantsByTripId(tripId);
            setParticipants(data);
        } catch {
            Alert.alert('Error', 'Failed to load participants.');
        }
    }, [tripId]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <ThemedView className="flex-1">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
            >
                <FlatList
                    data={participants}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{padding: 16, gap: 10, paddingBottom: 40}}
                    renderItem={({item}) => (
                        <ParticipantRow item={item} onSaved={load} onDeleted={load}/>
                    )}
                    ListHeaderComponent={
                        <ThemedText
                            textStyle="body"
                            variant="secondary"
                            className="text-[12px] font-semibold tracking-widest uppercase mb-1"
                        >
                            {participants.length} participant{participants.length !== 1 ? 's' : ''}
                        </ThemedText>
                    }
                    ListFooterComponent={
                        <AddParticipantCard tripId={tripId} onAdded={load}/>
                    }
                />
            </KeyboardAvoidingView>
        </ThemedView>
    );
}
