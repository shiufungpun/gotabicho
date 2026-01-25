import React from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTripDetails } from '../hooks/useTripDetails';

export default function ExpenseListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { tripId } = route.params || {};
  const { expenses } = useTripDetails(tripId);

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cat}>{item.category} <Text style={styles.memo}>{item.memo}</Text></Text>
              <Text style={styles.amt}>¥{item.amount.toLocaleString()}</Text>
            </View>
            <Text style={styles.date}>{item.date} • Paid by {item.paid_by_name}</Text>
          </View>
        )}
      />
      <View style={styles.fab}>
        <Button title="Add Expense" onPress={() => navigation.navigate('AddExpense', { tripId })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: {
    backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cat: { fontSize: 16, fontWeight: '500' },
  memo: { fontWeight: 'normal', color: '#666', fontSize: 14 },
  amt: { fontSize: 16, fontWeight: 'bold' },
  date: { color: '#888', fontSize: 12 },
  fab: { padding: 16 }
});
