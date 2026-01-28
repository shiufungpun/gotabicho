import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useTripDetails} from '../hooks/useTripDetails';
import {useTheme} from '../theme';
import {ThemedText, ThemedView} from '../components';

export default function TripOverviewScreen() {
    const route = useRoute<any>();
    const {tripId} = route.params || {};
    const {colors} = useTheme();

    const {trip, participants, receipts} = useTripDetails(tripId);

    if (!trip) return (
        <ThemedView style={styles.center}>
            <ThemedText>Loading...</ThemedText>
        </ThemedView>
    );

    const totalSpent = receipts.reduce((sum: number, r) => sum + r.total_amount, 0);

    return (
        <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
            <ThemedView variant="surface" style={styles.header}>
                <ThemedText style={styles.title}>{trip.name}</ThemedText>
                <ThemedText variant="secondary" style={styles.dates}>
                    {trip.start_date} ~ {trip.end_date}
                </ThemedText>
                <View style={[styles.totalBox, {backgroundColor: colors.primaryLight}]}>
                    <ThemedText variant="primaryColor" style={styles.totalLabel}>
                        Total Expenses
                    </ThemedText>
                    <Text style={[styles.totalValue, {color: colors.primary}]}>
                        ¥ {totalSpent.toLocaleString()}
                    </Text>
                </View>
            </ThemedView>

            <ThemedText style={styles.sectionTitle}>Participants Summary</ThemedText>
            {participants.map(p => {
                const remaining = p.budget_total ? p.budget_total - p.spent_total : null;
                return (
                    <ThemedView
                        key={p.id}
                        variant="surface"
                        style={[styles.participantRow, {borderBottomColor: colors.divider}]}
                    >
                        <View style={{flex: 1}}>
                            <ThemedText style={styles.pName}>{p.name}</ThemedText>
                            {p.budget_total && (
                                <ThemedText variant="tertiary" style={styles.budget}>
                                    Budget: ¥{p.budget_total.toLocaleString()}
                                </ThemedText>
                            )}
                        </View>
                        <View style={{alignItems: 'flex-end'}}>
                            <ThemedText style={styles.spent}>
                                Spent: ¥{p.spent_total.toLocaleString()}
                            </ThemedText>
                            {remaining !== null && (
                                <Text style={[
                                    styles.remaining,
                                    {color: remaining < 0 ? colors.error : colors.success}
                                ]}>
                                    {remaining >= 0 ? 'Left' : 'Over'}: ¥{Math.abs(remaining).toLocaleString()}
                                </Text>
                            )}
                        </View>
                    </ThemedView>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    header: {padding: 20, marginBottom: 10},
    title: {fontSize: 24, fontWeight: 'bold'},
    dates: {marginTop: 4, marginBottom: 16},
    totalBox: {padding: 16, borderRadius: 8, alignItems: 'center'},
    totalLabel: {fontSize: 14},
    totalValue: {fontSize: 32, fontWeight: 'bold', marginTop: 4},
    sectionTitle: {fontSize: 18, fontWeight: '600', margin: 16, marginBottom: 8},
    participantRow: {
        padding: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    pName: {fontSize: 16, fontWeight: '500'},
    budget: {fontSize: 12, marginTop: 2},
    spent: {fontSize: 14, fontWeight: '500'},
    remaining: {fontSize: 12, marginTop: 2}
});
