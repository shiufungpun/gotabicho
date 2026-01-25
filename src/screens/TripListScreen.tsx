import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTrips } from '../hooks/useTrips';
import { Trip } from '../types';

export default function TripListScreen() {
  const { trips, loading } = useTrips();
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TripHome', { tripId: item.id, title: item.name })}
    >
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>{item.start_date} - {item.end_date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No trips yet. Create one!</Text>}
      />
      <View style={styles.fabContainer}>
         <Button title="New Trip" onPress={() => navigation.navigate('AddTrip')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  list: { paddingBottom: 80 },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  fabContainer: { position: 'absolute', bottom: 20, right: 20, left: 20 }
});
