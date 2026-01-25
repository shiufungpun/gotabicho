import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createTrip } from '../repositories/tripRepository';

export default function AddTripScreen() {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const navigation = useNavigation();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }
    setSaving(true);
    try {
      await createTrip({
        name,
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
    <View style={styles.container}>
      <Text style={styles.label}>Trip Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Hokkaido Skiing" />

      <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2026-01-25" />

      <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2026-01-30" />

      <Button title={saving ? "Saving..." : "Create Trip"} onPress={handleSave} disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  label: { fontSize: 16, marginBottom: 8, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16
  }
});
