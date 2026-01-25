import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTripDetails } from '../hooks/useTripDetails';
import { createExpense } from '../repositories/expenseRepository';

export default function AddExpenseScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { tripId } = route.params || {};

  const { participants } = useTripDetails(tripId);

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
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Amount (JPY)</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="e.g. 1000" />

      <Text style={styles.label}>Category</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g. Food" />

      <Text style={styles.label}>Date</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-01-25" />

      <Text style={styles.label}>Memo</Text>
      <TextInput style={styles.input} value={memo} onChangeText={setMemo} placeholder="Details..." />

      <Text style={styles.label}>Paid By</Text>
      <View style={styles.chips}>
        {participants.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[styles.chip, paidById === p.id && styles.chipSelected]}
            onPress={() => setPaidById(p.id)}
          >
            <Text style={[styles.chipText, paidById === p.id && styles.chipTextSelected]}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Split Amongst (Avg)</Text>
      <View style={styles.chips}>
        {participants.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[styles.chip, splitWith.includes(p.id) && styles.chipSelected]}
            onPress={() => toggleSplit(p.id)}
          >
            <Text style={[styles.chipText, splitWith.includes(p.id) && styles.chipTextSelected]}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 20 }} />
      <Button title="Save Expense" onPress={handleSave} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  label: { fontSize: 14, marginBottom: 8, color: '#666', fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8, marginBottom: 8
  },
  chipSelected: { backgroundColor: '#007AFF' },
  chipText: { color: '#333' },
  chipTextSelected: { color: 'white' }
});
