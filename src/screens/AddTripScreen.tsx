import React, {useState} from 'react';
import {Alert, Button, StyleSheet, TextInput} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {createTrip} from '../repositories/tripRepository';
import {useTheme} from '../theme';
import {ThemedText, ThemedView} from '../components';

export default function AddTripScreen() {
    const [name, setName] = useState('');
    const [budget, setBudget] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const navigation = useNavigation();
    const [saving, setSaving] = useState(false);
    const {colors} = useTheme();

    const handleSave = async () => {
        if (!name) {
            Alert.alert('Error', 'Please enter a trip name');
            return;
        }

        let budgetValue: number | null = null;
        if (budget) {
            const parsed = parseFloat(budget);
            if (isNaN(parsed) || parsed < 0) {
                Alert.alert('Error', 'Please enter a valid budget amount');
                return;
            }
            budgetValue = parsed;
        }

        setSaving(true);
        try {
            await createTrip({
                name,
                total_budget: budgetValue,
                start_date: startDate,
                end_date: endDate,
                base_currency: 'JPY'
            });
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', 'Failed to create trip');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ThemedView variant="surface" style={styles.container}>
            <ThemedText style={styles.label}>Trip Name</ThemedText>
            <TextInput
                style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface
                }]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Hokkaido Skiing"
                placeholderTextColor={colors.textTertiary}
            />

            <ThemedText style={styles.label}>Total Budget (Optional)</ThemedText>
            <TextInput
                style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface
                }]}
                value={budget}
                onChangeText={setBudget}
                placeholder="e.g. 100000"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
            />

            <ThemedText style={styles.label}>Start Date (YYYY-MM-DD)</ThemedText>
            <TextInput
                style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface
                }]}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="2026-01-25"
                placeholderTextColor={colors.textTertiary}
            />

            <ThemedText style={styles.label}>End Date (YYYY-MM-DD)</ThemedText>
            <TextInput
                style={[styles.input, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface
                }]}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="2026-01-30"
                placeholderTextColor={colors.textTertiary}
            />

            <Button title={saving ? "Saving..." : "Create Trip"} onPress={handleSave} disabled={saving}/>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20},
    label: {fontSize: 16, marginBottom: 8, fontWeight: '500'},
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16
    }
});
