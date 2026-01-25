import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTripDetails } from '../hooks/useTripDetails';

export default function TripOverviewScreen() {
  const route = useRoute<any>();
  const { tripId } = route.params || {}; // Usually passed by TabNavigator params or context
  // Note: nested navigators might need route.params from parent if not passed down.
  // We'll handle this in Navigation setup.

  // If used inside Tab.Screen directly which is inside Stack, params might be tricky.
  // Better to use a context or expect params properly.
  // We will assume initialParams are passed to the screens.

  const { trip, participants, expenses, loading } = useTripDetails(tripId);

  if (!trip) return <View style={styles.center}><Text>Loading...</Text></View>;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{trip.name}</Text>
        <Text style={styles.dates}>{trip.start_date} ~ {trip.end_date}</Text>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Expenses</Text>
          <Text style={styles.totalValue}>¥ {totalSpent.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Participants Summary</Text>
      {participants.map(p => {
        const remaining = p.budget_total ? p.budget_total - p.spent_total : null;
        return (
          <View key={p.id} style={styles.participantRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pName}>{p.name}</Text>
              {p.budget_total && (
                <Text style={styles.budget}>Budget: ¥{p.budget_total.toLocaleString()}</Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.spent}>Spent: ¥{p.spent_total.toLocaleString()}</Text>
              {remaining !== null && (
                <Text style={[styles.remaining, { color: remaining < 0 ? 'red' : 'green' }]}>
                  {remaining >= 0 ? 'Left' : 'Over'}: ¥{Math.abs(remaining).toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: 'white', padding: 20, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  dates: { color: '#666', marginTop: 4, marginBottom: 16 },
  totalBox: { backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#1565c0' },
  totalValue: { fontSize: 32, fontWeight: 'bold', color: '#1565c0', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', margin: 16, marginBottom: 8 },
  participantRow: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  pName: { fontSize: 16, fontWeight: '500' },
  budget: { fontSize: 12, color: '#888', marginTop: 2 },
  spent: { fontSize: 14, fontWeight: '500' },
  remaining: { fontSize: 12, marginTop: 2 }
});
