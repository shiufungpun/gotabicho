import React, {forwardRef, useCallback, useRef, useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, ScrollView, View,} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {useRouter} from 'expo-router';
import {useTheme} from '../../theme';
import {createTrip} from '../../repositories/tripRepository';
import ConfirmGlassButtonBar from '../ui/ConfirmGlassButtonBar';
import {TripNameCard} from '../trip/form/TripNameCard';
import {TripDateCard, TripDateCardRef} from '../trip/form/TripDateCard';
import {TripCurrencyCard} from '../trip/form/TripCurrencyCard';
import {TripBudgetCard} from '../trip/form/TripBudgetCard';

const AddTripSheet = forwardRef<TrueSheet>((_, ref) => {
    // ── form state ────────────────────────────────────────────────────────────
    const [name, setName] = useState('');
    const [startId, setStartId] = useState<string | undefined>(undefined);
    const [endId, setEndId] = useState<string | undefined>(undefined);
    const [currency, setCurrency] = useState('JPY');
    const [hasBudget, setHasBudget] = useState(false);
    const [budgetValue, setBudgetValue] = useState(100000);
    const [saving, setSaving] = useState(false);

    const router = useRouter();
    const {colors} = useTheme();
    const dateCardRef = useRef<TripDateCardRef>(null);

    // ── helpers ───────────────────────────────────────────────────────────────
    const dismiss = useCallback(() => {
        if (ref && 'current' in ref && ref.current) {
            ref.current.dismiss();
        }
    }, [ref]);

    const resetForm = useCallback(() => {
        setName('');
        setStartId(undefined);
        setEndId(undefined);
        setCurrency('JPY');
        setHasBudget(false);
        setBudgetValue(100000);
        // Reset the uncontrolled calendar state imperatively
        dateCardRef.current?.reset();
    }, []);

    // ── handlers ──────────────────────────────────────────────────────────────
    const handleRangeChange = useCallback((s: string | undefined, e: string | undefined) => {
        setStartId(s);
        setEndId(e);
    }, []);

    const handleSave = useCallback(async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a trip name');
            return;
        }
        if (!startId || !endId) {
            Alert.alert('Error', 'Please select a start and end date');
            return;
        }
        if (endId < startId) {
            Alert.alert('Error', 'End date cannot be earlier than start date');
            return;
        }
        setSaving(true);
        try {
            const result = await createTrip({
                name: name.trim(),
                total_budget: hasBudget ? budgetValue : null,
                start_date: startId,
                end_date: endId,
                base_currency: currency,
            });
            dismiss();
            resetForm();
            router.navigate('trip/' + result);
        } catch (e) {
            console.error('Failed to create trip:', e);
            Alert.alert('Error', 'Failed to create trip');
        } finally {
            setSaving(false);
        }
    }, [name, startId, endId, hasBudget, budgetValue, currency, dismiss, resetForm, router]);

    const handleCancel = useCallback(() => {
        resetForm();
        dismiss();
    }, [resetForm, dismiss]);

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <TrueSheet
            ref={ref}
            detents={['auto', 1]}
            cornerRadius={24}
            backgroundColor={colors.background}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={{paddingBottom: 40}}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header bar */}
                    <ConfirmGlassButtonBar
                        title="New Trip"
                        onConfirm={handleSave}
                        disabled={saving}
                        onCancel={handleCancel}
                    />

                    {/* Cards — Name → Date → Currency → Budget */}
                    <View className="mx-4 gap-y-4">
                        <TripNameCard value={name} onChangeText={setName}/>

                        <TripDateCard
                            ref={dateCardRef}
                            onRangeChange={handleRangeChange}
                        />

                        <TripCurrencyCard value={currency} onChange={setCurrency}/>

                        <TripBudgetCard
                            hasBudget={hasBudget}
                            onHasBudgetChange={setHasBudget}
                            budgetValue={budgetValue}
                            onBudgetValueChange={setBudgetValue}
                            currency={currency}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TrueSheet>
    );
});

AddTripSheet.displayName = 'AddTripSheet';

export default AddTripSheet;

