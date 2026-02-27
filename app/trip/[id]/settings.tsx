import React, {useEffect, useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {ChevronRightIcon, TrashIcon, UsersIcon} from 'lucide-react-native';
import {useTripDetails} from '../../../src/hooks/useTripDetails';
import {deleteTrip, updateTrip} from '../../../src/repositories/tripRepository';
import {useTheme} from '../../../src/theme';
import {ThemedCard, ThemedText, ThemedView} from '../../../src/components';
import ConfirmGlassButtonBar from '../../../src/components/ui/ConfirmGlassButtonBar';
import {BudgetCard, DatesCard, TripInfoCard} from '../../../src/components/trip/settings';

export default function TripSettingsScreen() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const tripId = parseInt(id || '0');
    const {trip, refresh} = useTripDetails(tripId);
    const {colors} = useTheme();
    const router = useRouter();

    // Form state
    const [name, setName] = useState('');
    const [hasBudget, setHasBudget] = useState(false);
    const [budgetValue, setBudgetValue] = useState(100000);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [currency, setCurrency] = useState('JPY');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [saving, setSaving] = useState(false);

    // Sync form when trip data loads
    useEffect(() => {
        if (!trip) return;
        setName(trip.name ?? '');
        setHasBudget(!!trip.total_budget);
        setBudgetValue(trip.total_budget ?? 100000);
        setStartDate(trip.start_date ? new Date(trip.start_date) : new Date());
        setEndDate(trip.end_date ? new Date(trip.end_date) : new Date());
        setCurrency(trip.base_currency ?? 'JPY');
    }, [trip]);

    const resetForm = () => {
        if (!trip) return;
        setName(trip.name ?? '');
        setHasBudget(!!trip.total_budget);
        setBudgetValue(trip.total_budget ?? 100000);
        setStartDate(trip.start_date ? new Date(trip.start_date) : new Date());
        setEndDate(trip.end_date ? new Date(trip.end_date) : new Date());
        setCurrency(trip.base_currency ?? 'JPY');
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a trip name.');
            return;
        }
        if (endDate < startDate) {
            Alert.alert('Error', 'End date cannot be before start date.');
            return;
        }
        setSaving(true);
        try {
            await updateTrip(tripId, {
                name: name.trim(),
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                base_currency: currency,
                total_budget: hasBudget ? budgetValue : null,
            });
            refresh();
        } catch {
            Alert.alert('Error', 'Failed to save trip settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Trip',
            `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTrip(tripId);
                            router.dismissAll();
                        } catch {
                            Alert.alert('Error', 'Failed to delete trip.');
                        }
                    },
                },
            ],
        );
    };

    return (
        <ThemedView className="flex-1">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={{paddingBottom: 48}}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Header bar ── */}
                    <ConfirmGlassButtonBar
                        title="Trip Settings"
                        onConfirm={handleSave}
                        onCancel={resetForm}
                        disabled={saving}
                    />

                    <View className="px-4 gap-3">
                        {/* ── Trip name + currency ── */}
                        <TripInfoCard
                            name={name}
                            onNameChange={setName}
                            currency={currency}
                            onCurrencyChange={setCurrency}
                        />

                        {/* ── Budget ── */}
                        <BudgetCard
                            hasBudget={hasBudget}
                            onToggle={setHasBudget}
                            budgetValue={budgetValue}
                            onBudgetChange={setBudgetValue}
                            currency={currency}
                        />

                        {/* ── Dates ── */}
                        <DatesCard
                            startDate={startDate}
                            endDate={endDate}
                            showStartPicker={showStartPicker}
                            showEndPicker={showEndPicker}
                            onStartPress={() => setShowStartPicker(true)}
                            onEndPress={() => setShowEndPicker(true)}
                            onStartConfirm={d => {
                                setShowStartPicker(false);
                                setStartDate(d);
                            }}
                            onEndConfirm={d => {
                                setShowEndPicker(false);
                                setEndDate(d);
                            }}
                            onStartCancel={() => setShowStartPicker(false)}
                            onEndCancel={() => setShowEndPicker(false)}
                        />

                        {/* ── Manage participants ── */}
                        <ThemedCard>
                            <TouchableOpacity
                                className="flex-row items-center justify-between"
                                onPress={() => router.push(`/trip/${tripId}/edit-participants`)}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center gap-3">
                                    <UsersIcon size={20} color={colors.primary}/>
                                    <ThemedText textStyle="content">Manage Participants</ThemedText>
                                </View>
                                <ChevronRightIcon size={18} color={colors.textTertiary}/>
                            </TouchableOpacity>
                        </ThemedCard>

                        {/* ── Danger zone ── */}
                        <ThemedCard>
                            <TouchableOpacity
                                className="flex-row items-center gap-3"
                                onPress={handleDelete}
                                activeOpacity={0.7}
                            >
                                <TrashIcon size={20} color={colors.error}/>
                                <ThemedText textStyle="content" variant="error">Delete Trip</ThemedText>
                            </TouchableOpacity>
                        </ThemedCard>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}
