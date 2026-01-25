import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTripDetails } from '../hooks/useTripDetails';

export default function SettlementScreen() {
  const route = useRoute<any>();
  const { tripId } = route.params || {};
  const { settlements } = useTripDetails(tripId);

  return (
    <View style={styles.container}>
      <Text style={styles.info}>Suggested repayments to clear debts.</Text>
      <FlatList
        data={settlements}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.line}>
              <Text style={styles.from}>{item.from_name}</Text>
              <Text> pays </Text>
              <Text style={styles.to}>{item.to_name}</Text>
            </Text>
            <Text style={styles.amount}>¥{item.amount.toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>All settled up!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  info: { textAlign: 'center', marginBottom: 16, color: '#666' },
  card: {
    backgroundColor: 'white', padding: 20, borderRadius: 8, marginBottom: 12, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'space-between'
  },
  line: { fontSize: 16 },
  from: { fontWeight: 'bold', color: '#d32f2f' },
  to: { fontWeight: 'bold', color: '#388e3c' },
  amount: { fontSize: 20, fontWeight: 'bold', color: '#1565c0' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888', fontStyle: 'italic' }
});
