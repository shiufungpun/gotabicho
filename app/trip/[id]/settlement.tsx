import React from 'react';
import {FlatList, StyleSheet, Text} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {useTripDetails} from '../../../src/hooks/useTripDetails';
import {useTheme} from '../../../src/theme';
import {ThemedCard, ThemedText, ThemedView} from '../../../src/components';

export default function SettlementScreen() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const tripId = parseInt(id || '0');
    const {settlements} = useTripDetails(tripId);
    const {colors} = useTheme();

    return (
        <ThemedView style={styles.container}>
            <ThemedText variant="secondary" style={styles.info}>
                Suggested repayments to clear debts.
            </ThemedText>
            <FlatList
                data={settlements}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                    <ThemedCard style={styles.card}>
                        <Text style={styles.line}>
                            <Text style={[styles.from, {color: colors.settlementFrom}]}>{item.from_name}</Text>
                            <ThemedText> pays </ThemedText>
                            <Text style={[styles.to, {color: colors.settlementTo}]}>{item.to_name}</Text>
                        </Text>
                        <Text style={[styles.amount, {color: colors.settlementAmount}]}>
                            ¥{item.amount.toLocaleString()}
                        </Text>
                    </ThemedCard>
                )}
                ListEmptyComponent={
                    <ThemedText variant="tertiary" style={styles.empty}>
                        All settled up!
                    </ThemedText>
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 16},
    info: {textAlign: 'center', marginBottom: 16},
    card: {
        padding: 20, borderRadius: 8, marginBottom: 12, alignItems: 'center',
        flexDirection: 'row', justifyContent: 'space-between'
    },
    line: {fontSize: 16},
    from: {fontWeight: 'bold'},
    to: {fontWeight: 'bold'},
    amount: {fontSize: 20, fontWeight: 'bold'},
    empty: {textAlign: 'center', marginTop: 40, fontStyle: 'italic'}
});
