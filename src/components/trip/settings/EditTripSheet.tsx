/**
 * EditTripSheet — TrueSheet form for editing an existing trip.
 * Reuses TripInfoCard, BudgetCard, DatesCard and ConfirmGlassButtonBar.
 */
import React, {forwardRef, useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, ScrollView, View} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {useTheme} from '../../../theme';
import {updateTrip} from '../../../repositories/tripRepository';
import {TripDetails} from '../../../hooks/useTrips';
import ConfirmGlassButtonBar from '../../ui/ConfirmGlassButtonBar';
import {BudgetCard, DatesCard, TripInfoCard} from './index';

interface Props {
    trip: TripDetails | null;
    onSaved: () => void;
}

const EditTripSheet = forwardRef<TrueSheet, Props>(({trip, onSaved}, ref) => {
    const {colors} = useTheme();

    // Form state — populated when the sheet is presented
    const [name, setName] = useState('');
    const [hasBudget, setHasBudget] = useState(false);
    const [budgetValue, setBudgetValue] = useState(100000);
    const [currency, setCurrency] = useState('JPY');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [saving, setSaving] = useState(false);

    const dismiss = () => {
        if (ref && 'current' in ref && ref.current) {
            ref.current.dismiss();
        }
    };

    // Populate form from the current trip data
    const syncFromTrip = () => {
        if (!trip) return;
        setName(trip.name ?? '');
        setHasBudget(!!trip.total_budget);
        setBudgetValue(trip.total_budget ?? 100000);
        setCurrency(trip.base_currency ?? 'JPY');
        setStartDate(trip.start_date ? new Date(trip.start_date) : new Date());
        setEndDate(trip.end_date ? new Date(trip.end_date) : new Date());
    };

    const handleCancel = () => {
        dismiss();
    };

    const handleSave = async () => {
        if (!trip) return;
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
            await updateTrip(trip.id, {
                name: name.trim(),
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                base_currency: currency,
                total_budget: hasBudget ? budgetValue : null,
            });
            dismiss();
            onSaved();
        } catch {
            Alert.alert('Error', 'Failed to save trip settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <TrueSheet
            ref={ref}
            detents={['auto', 1]}
            cornerRadius={24}
            backgroundColor={colors.background}
            onDidPresent={syncFromTrip}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={{paddingBottom: 40}}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header bar */}
                    <ConfirmGlassButtonBar
                        title="Edit Trip"
                        onConfirm={handleSave}
                        onCancel={handleCancel}
                        disabled={saving}
                    />

                    <View className="px-4 gap-3">
                        {/* Trip name + currency */}
                        <TripInfoCard
                            name={name}
                            onNameChange={setName}
                            currency={currency}
                            onCurrencyChange={setCurrency}
                        />

                        {/* Budget */}
                        <BudgetCard
                            hasBudget={hasBudget}
                            onToggle={setHasBudget}
                            budgetValue={budgetValue}
                            onBudgetChange={setBudgetValue}
                            currency={currency}
                        />

                        {/* Dates */}
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
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TrueSheet>
    );
});

EditTripSheet.displayName = 'EditTripSheet';

export default EditTripSheet;


