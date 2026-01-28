import React, {useState} from 'react';
import {Alert, Button, FlatList, StyleSheet, TextInput, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useTripDetails} from '../hooks/useTripDetails';
import {createParticipant, deleteParticipant} from '../repositories/participantRepository';
import {useTheme} from '../theme';
import {ThemedText, ThemedView} from '../components';

export default function ParticipantListScreen() {
    const route = useRoute<any>();
    const {tripId} = route.params || {};
    const {participants, refresh} = useTripDetails(tripId);
    const {colors} = useTheme();

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
        <ThemedView style={styles.container}>
            <ThemedView variant="surface" style={styles.form}>
                <ThemedText style={styles.header}>Add Participant</ThemedText>
                <TextInput
                    style={[styles.input, {
                        borderColor: colors.border,
                        color: colors.text,
                        backgroundColor: colors.surface
                    }]}
                    placeholder="Name (e.g. Alice)"
                    placeholderTextColor={colors.textTertiary}
                    value={newName}
                    onChangeText={setNewName}
                />
                <TextInput
                    style={[styles.input, {
                        borderColor: colors.border,
                        color: colors.text,
                        backgroundColor: colors.surface
                    }]}
                    placeholder="Budget (Optional)"
                    placeholderTextColor={colors.textTertiary}
                    value={newBudget}
                    onChangeText={setNewBudget}
                    keyboardType="numeric"
                />
                <Button title="Add" onPress={handleAdd}/>
            </ThemedView>

            <FlatList
                data={participants}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <ThemedView variant="surface" style={[styles.row, {borderBottomColor: colors.divider}]}>
                        <View>
                            <ThemedText style={styles.name}>{item.name}</ThemedText>
                            <ThemedText variant="secondary" style={styles.sub}>
                                {item.budget_total ? `Budget: ¥${item.budget_total}` : 'No Budget'}
                            </ThemedText>
                        </View>
                        <Button title="Remove" color="red" onPress={() => handleDelete(item.id)}/>
                    </ThemedView>
                )}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    form: {padding: 16, marginBottom: 10},
    header: {fontWeight: 'bold', marginBottom: 12},
    input: {
        borderWidth: 1, borderRadius: 6, padding: 10, marginBottom: 10
    },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderBottomWidth: 1
    },
    name: {fontSize: 16, fontWeight: '500'},
    sub: {fontSize: 12}
});
