import React from 'react';
import {Button, FlatList, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTripDetails} from '../hooks/useTripDetails';
import {useTheme} from '../theme';
import {ThemedCard, ThemedText, ThemedView} from '../components';

export default function ExpenseListScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const {tripId} = route.params || {};
    const {expenses} = useTripDetails(tripId);
    const {colors} = useTheme();

    return (
        <ThemedView style={styles.container}>
            <FlatList
                data={expenses}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <ThemedCard style={[styles.card, {borderBottomColor: colors.divider}]}>
                        <View style={styles.row}>
                            <ThemedText style={styles.cat}>
                                {item.category} <Text
                                style={[styles.memo, {color: colors.textSecondary}]}>{item.memo}</Text>
                            </ThemedText>
                            <ThemedText style={styles.amt}>¥{item.amount.toLocaleString()}</ThemedText>
                        </View>
                        <ThemedText variant="tertiary" style={styles.date}>
                            {item.date} • Paid by {item.paid_by_name}
                        </ThemedText>
                    </ThemedCard>
                )}
            />
            <View style={styles.fab}>
                <Button title="Add Expense" onPress={() => navigation.navigate('AddExpense', {tripId})}/>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    card: {
        padding: 16, borderBottomWidth: 1
    },
    row: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4},
    cat: {fontSize: 16, fontWeight: '500'},
    memo: {fontWeight: 'normal', fontSize: 14},
    amt: {fontSize: 16, fontWeight: 'bold'},
    date: {fontSize: 12},
    fab: {padding: 16}
});
