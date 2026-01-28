import React, {useEffect, useState} from 'react';
import {Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTripDetails} from '../hooks/useTripDetails';
import {createExpense} from '../repositories/expenseRepository';
import {useTheme} from '../theme';
import {ThemedText} from '../components';

export default function AddExpenseScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const {tripId} = route.params || {};
    const {colors} = useTheme();

    const {participants} = useTripDetails(tripId);

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [memo, setMemo] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paidById, setPaidById] = useState<number | null>(null);
    const [splitWith, setSplitWith] = useState<number[]>([]);

    // Default select all participants when loaded
    useEffect(() => {
        if (participants.length > 0) {
            if (!paidById) setPaidById(participants[0].id);
            if (splitWith.length === 0) setSplitWith(participants.map(p => p.id));
        }
    }, [participants]);

    const toggleSplit = (id: number) => {
        if (splitWith.includes(id)) {
            setSplitWith(splitWith.filter(i => i !== id));
        } else {
            setSplitWith([...splitWith, id]);
        }
    };

    const handleSave = async () => {
        if (!amount || !paidById || splitWith.length === 0) {
            Alert.alert('Error', 'Please fill in amount, payer and at least one splitter.');
            return;
        }

        try {
            await createExpense({
                trip_id: tripId,
                amount: parseFloat(amount),
                currency: 'JPY',
                category: category || 'General',
                paid_by_participant_id: paidById,
                date: date,
                memo: memo
            }, splitWith);
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', 'Failed to save expense');
        }
    };

    return (
        <ScrollView style={[styles.container, {backgroundColor: colors.surface}]}>
            <ThemedText variant="secondary" style={styles.label}>Amount (JPY)</ThemedText>
            <TextInput
                style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface
                }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="e.g. 1000"
                placeholderTextColor={colors.textTertiary}
            />

            <ThemedText variant="secondary" style={styles.label}>Category</ThemedText>
            <TextInput
                style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface
                }]}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Food"
                placeholderTextColor={colors.textTertiary}
            />

            <ThemedText variant="secondary" style={styles.label}>Date</ThemedText>
            <TextInput
                style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface
                }]}
                value={date}
                onChangeText={setDate}
                placeholder="2026-01-25"
                placeholderTextColor={colors.textTertiary}
            />

            <ThemedText variant="secondary" style={styles.label}>Memo</ThemedText>
            <TextInput
                style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface
                }]}
                value={memo}
                onChangeText={setMemo}
                placeholder="Details..."
                placeholderTextColor={colors.textTertiary}
            />

            <ThemedText variant="secondary" style={styles.label}>Paid By</ThemedText>
            <View style={styles.chips}>
                {participants.map(p => (
                    <TouchableOpacity
                        key={p.id}
                        style={[
                            styles.chip,
                            {backgroundColor: colors.divider},
                            paidById === p.id && {backgroundColor: colors.primary}
                        ]}
                        onPress={() => setPaidById(p.id)}
                    >
                        <Text style={[
                            styles.chipText,
                            {color: colors.text},
                            paidById === p.id && styles.chipTextSelected
                        ]}>
                            {p.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ThemedText variant="secondary" style={styles.label}>Split Amongst (Avg)</ThemedText>
            <View style={styles.chips}>
                {participants.map(p => (
                    <TouchableOpacity
                        key={p.id}
                        style={[
                            styles.chip,
                            {backgroundColor: colors.divider},
                            splitWith.includes(p.id) && {backgroundColor: colors.primary}
                        ]}
                        onPress={() => toggleSplit(p.id)}
                    >
                        <Text style={[
                            styles.chipText,
                            {color: colors.text},
                            splitWith.includes(p.id) && styles.chipTextSelected
                        ]}>
                            {p.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{height: 20}}/>
            <Button title="Save Expense" onPress={handleSave}/>
            <View style={{height: 40}}/>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20},
    label: {fontSize: 14, marginBottom: 8, fontWeight: '600'},
    input: {
        borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16
    },
    chips: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20},
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8
    },
    chipText: {},
    chipTextSelected: {color: 'white'}
});
