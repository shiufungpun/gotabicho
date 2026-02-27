/**
 * ParticipantRow — single editable row in the edit-participants screen.
 * Inline name + budget inputs, save ✓ button, and a delete 🗑 button
 * (hidden for the default "You" participant).
 */
import React, {useEffect, useState} from 'react';
import {Alert, TextInput, TouchableOpacity, View} from 'react-native';
import {CheckIcon, Trash2Icon} from 'lucide-react-native';
import {deleteParticipant, updateParticipant} from '../../../repositories/participantRepository';
import {useTheme} from '../../../theme';
import {ThemedCard} from '../../index';
import {Participant} from '../../../types';

interface Props {
    item: Participant;
    onSaved: () => void;
    onDeleted: () => void;
}

export function ParticipantRow({item, onSaved, onDeleted}: Props) {
    const {colors} = useTheme();
    const isYou = item.name === 'You';

    const [name, setName] = useState(item.name);
    const [budget, setBudget] = useState(item.budget_total != null ? String(item.budget_total) : '');
    const [saving, setSaving] = useState(false);

    // Keep in sync when parent refreshes the list
    useEffect(() => {
        setName(item.name);
        setBudget(item.budget_total != null ? String(item.budget_total) : '');
    }, [item.name, item.budget_total]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Participant name cannot be empty.');
            return;
        }
        setSaving(true);
        try {
            await updateParticipant(item.id, {
                name: name.trim(),
                budget_total: budget ? parseFloat(budget) : null,
            });
            onSaved();
        } catch {
            Alert.alert('Error', 'Failed to update participant.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Remove Participant',
            `Remove "${item.name}" from this trip?`,
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteParticipant(item.id);
                            onDeleted();
                        } catch (e: any) {
                            Alert.alert('Cannot Remove', e?.message ?? 'Failed to remove participant.');
                        }
                    },
                },
            ],
        );
    };

    return (
        <ThemedCard elevated={false} className="rounded-2xl p-3 gap-2">
            {/* Input row */}
            <View className="flex-row items-center gap-2">
                <TextInput
                    className="flex-[2] border rounded-xl px-3 py-2.5 text-[15px]"
                    style={{borderColor: colors.border, color: colors.text, backgroundColor: colors.surface}}
                    value={name}
                    onChangeText={setName}
                    placeholder="Name"
                    placeholderTextColor={colors.textTertiary}
                    editable={!isYou}
                    selectTextOnFocus={!isYou}
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

            {/* Actions row */}
            <View className="flex-row justify-end items-center gap-2">
                {/* Save */}
                <TouchableOpacity
                    className="w-9 h-9 rounded-xl items-center justify-center"
                    style={{backgroundColor: colors.primaryLight}}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.7}
                >
                    <CheckIcon size={18} color={colors.primary}/>
                </TouchableOpacity>

                {/* Delete — hidden for "You" */}
                {!isYou && (
                    <TouchableOpacity
                        className="w-9 h-9 rounded-xl items-center justify-center bg-red-50"
                        onPress={handleDelete}
                        activeOpacity={0.7}
                    >
                        <Trash2Icon size={18} color={colors.error}/>
                    </TouchableOpacity>
                )}
            </View>
        </ThemedCard>
    );
}

