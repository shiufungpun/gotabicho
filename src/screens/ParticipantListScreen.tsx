import React, {useState} from 'react';
import {Alert, Button, FlatList, StyleSheet, Text, TextInput, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useTripDetails} from '../hooks/useTripDetails';
import {createParticipant, deleteParticipant} from '../repositories/participantRepository';

export default function ParticipantListScreen() {
    const route = useRoute<any>();
    const {tripId} = route.params || {};
    const {participants, refresh} = useTripDetails(tripId);

    const [newName, setNewName] = useState('');
    const [newBudget, setNewBudget] = useState('');

    const handleAdd = async () => {
        if (!newName) return;
        try {
            await createParticipant({
                trip_id: tripId,
                name: newName,
                budget_total: newBudget ? parseFloat(newBudget) : null
            });
            setNewName('');
            setNewBudget('');
            refresh();
        } catch (e) {
            Alert.alert('Error', 'Could not add participant');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteParticipant(id);
            refresh();
        } catch (e) {
            Alert.alert('Error', 'Cannot delete participant (may have expenses attached)');
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.header}>Add Participant</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Name (e.g. Alice)"
                    value={newName}
                    onChangeText={setNewName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Budget (Optional)"
                    value={newBudget}
                    onChangeText={setNewBudget}
                    keyboardType="numeric"
                />
                <Button title="Add" onPress={handleAdd}/>
            </View>

            <FlatList
                data={participants}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text
                                style={styles.sub}>{item.budget_total ? `Budget: ¥${item.budget_total}` : 'No Budget'}</Text>
                        </View>
                        <Button title="Remove" color="red" onPress={() => handleDelete(item.id)}/>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f5f5f5'},
    form: {padding: 16, backgroundColor: 'white', marginBottom: 10},
    header: {fontWeight: 'bold', marginBottom: 12},
    input: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 10
    },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee'
    },
    name: {fontSize: 16, fontWeight: '500'},
    sub: {color: '#666', fontSize: 12}
});
