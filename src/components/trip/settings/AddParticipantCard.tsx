/**
 * AddParticipantCard — form at the bottom of the participants screen to add a new participant.
 */
import React from 'react';
import {Alert, TextInput, TouchableOpacity, View} from 'react-native';
import {PlusIcon} from 'lucide-react-native';
import {createParticipant} from '../../../repositories/participantRepository';
import {useTheme} from '../../../theme';
import {ThemedCard, ThemedText} from '../../index';
import {SectionLabel} from './SectionLabel';

interface Props {
    tripId: number;
    onAdded: () => void;
}

export function AddParticipantCard({tripId, onAdded}: Props) {
    const {colors} = useTheme();
    const [name, setName] = React.useState('');
    const [budget, setBudget] = React.useState('');
    const [adding, setAdding] = React.useState(false);

    const handleAdd = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a participant name.');
            return;
        }
        setAdding(true);
        try {
            await createParticipant({
                trip_id: tripId,
                name: name.trim(),
                budget_total: budget ? parseFloat(budget) : null,
            });
            setName('');
            setBudget('');
            onAdded();
        } catch {
            Alert.alert('Error', 'Failed to add participant.');
        } finally {
            setAdding(false);
        }
    };

    return (
        <ThemedCard className="mt-2 gap-3">
            <SectionLabel>Add Participant</SectionLabel>

            <View className="flex-row items-center gap-2">
                <TextInput
                    className="flex-[2] border rounded-xl px-3 py-2.5 text-[15px]"
                    style={{borderColor: colors.border, color: colors.text, backgroundColor: colors.surface}}
                    value={name}
                    onChangeText={setName}
                    placeholder="Name (e.g. Alice)"
                    placeholderTextColor={colors.textTertiary}
                />
                <TextInput
                    className="flex-1 border rounded-xl px-3 py-2.5 text-[15px]"
                    style={{borderColor: colors.border, color: colors.text, backgroundColor: colors.surface}}
                    value={budget}
                    onChangeText={setBudget}
                    placeholder="Budget"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                />
            </View>

            <TouchableOpacity
                className="flex-row items-center justify-center gap-2 rounded-xl py-3 mt-1"
                style={{backgroundColor: adding ? colors.border : colors.primary}}
                onPress={handleAdd}
                disabled={adding}
                activeOpacity={0.8}
            >
                <PlusIcon size={18} color="#fff"/>
                <ThemedText style={{color: '#fff', fontWeight: '600'}} textStyle="body">
                    Add Participant
                </ThemedText>
            </TouchableOpacity>
        </ThemedCard>
    );
}

