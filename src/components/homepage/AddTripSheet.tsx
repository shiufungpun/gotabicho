import React, {forwardRef, useState} from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import DatePicker from 'react-native-date-picker';
import Slider from '@react-native-community/slider';
import {useRouter} from 'expo-router';
import {useTheme} from '../../theme';
import {createTrip} from '../../repositories/tripRepository';
import {ThemedCard, ThemedText} from '../index';
import ConfirmGlassButtonBar from '../ui/ConfirmGlassButtonBar';

const AddTripSheet = forwardRef<TrueSheet>((_, ref) => {
    const [name, setName] = useState('');
    const [hasBudget, setHasBudget] = useState(false);
    const [budgetValue, setBudgetValue] = useState(100000);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [saving, setSaving] = useState(false);

    const router = useRouter();
    const {colors} = useTheme();

    const dismiss = () => {
        if (ref && 'current' in ref && ref.current) {
            ref.current.dismiss();
        }
    };

    const resetForm = () => {
        setName('');
        setHasBudget(false);
        setBudgetValue(100000);
        setStartDate(new Date());
        setEndDate(new Date());
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a trip name');
            return;
        }

        if (endDate < startDate) {
            Alert.alert('Error', 'End date cannot be earlier than start date');
            return;
        }

        setSaving(true);
        try {
            const result = await createTrip({
                name: name.trim(),
                total_budget: hasBudget ? budgetValue : null,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                base_currency: 'JPY',
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
    };

    const handleCancel = () => {
        resetForm();
        dismiss();
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

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
                >
                    {/* Header bar with confirm / cancel buttons */}
                    <ConfirmGlassButtonBar
                        title="New Trip"
                        onConfirm={handleSave}
                        disabled={saving}
                        onCancel={handleCancel}
                    />

                    <View style={{marginHorizontal: 20}}>
                        <ThemedCard>
                            {/* Trip Name */}
                            <ThemedText variant="primary" textStyle="content" className="mb-2">
                                Trip Name
                            </ThemedText>
                            <TextInput
                                className="border rounded-xl p-4 text-lg"
                                style={{
                                    borderColor: colors.border,
                                    color: colors.text,
                                    backgroundColor: colors.surface,
                                    fontFamily: 'HinaMincho_400Regular',
                                }}
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g. Hokkaido Ski Trip"
                                placeholderTextColor={colors.textTertiary}
                            />

                            {/* Budget Toggle */}
                            <View className="flex-row justify-between items-center mt-4 mb-2">
                                <ThemedText variant="primary" textStyle="content">
                                    Set Budget
                                </ThemedText>
                                <Switch
                                    value={hasBudget}
                                    onValueChange={setHasBudget}
                                    trackColor={{false: colors.border, true: colors.primary}}
                                />
                            </View>

                            {/* Budget Slider */}
                            {hasBudget && (
                                <View className="mt-2 mb-2">
                                    <ThemedText
                                        variant="primary"
                                        textStyle="caption"
                                        className="text-center text-[28px] font-semibold mb-2"
                                    >
                                        ¥{budgetValue.toLocaleString('ja-JP')}
                                    </ThemedText>
                                    <Slider
                                        style={{width: '100%', height: 40}}
                                        minimumValue={10000}
                                        maximumValue={1000000}
                                        step={10000}
                                        value={budgetValue}
                                        onValueChange={setBudgetValue}
                                        minimumTrackTintColor={colors.primary}
                                        maximumTrackTintColor={colors.border}
                                    />
                                    <View className="flex-row justify-between px-1">
                                        <ThemedText variant="tertiary" textStyle="caption">
                                            ¥10,000
                                        </ThemedText>
                                        <ThemedText variant="tertiary" textStyle="caption">
                                            ¥1,000,000
                                        </ThemedText>
                                    </View>
                                </View>
                            )}

                            {/* Start Date */}
                            <ThemedText variant="primary" textStyle="content" className="mb-2 mt-4">
                                Start Date
                            </ThemedText>
                            <TouchableOpacity
                                className="border rounded-xl p-4 items-center"
                                style={{borderColor: colors.border, backgroundColor: colors.surface}}
                                onPress={() => setShowStartPicker(true)}
                            >
                                <ThemedText variant="primary" textStyle="body">
                                    {formatDate(startDate)}
                                </ThemedText>
                            </TouchableOpacity>

                            {/* End Date */}
                            <ThemedText variant="primary" textStyle="content" className="mb-2 mt-4">
                                End Date
                            </ThemedText>
                            <TouchableOpacity
                                className="border rounded-xl p-4 items-center"
                                style={{borderColor: colors.border, backgroundColor: colors.surface}}
                                onPress={() => setShowEndPicker(true)}
                            >
                                <ThemedText variant="primary" textStyle="body">
                                    {formatDate(endDate)}
                                </ThemedText>
                            </TouchableOpacity>
                        </ThemedCard>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Date Pickers */}
            <DatePicker
                modal
                open={showStartPicker}
                date={startDate}
                mode="date"
                onConfirm={(date) => {
                    setShowStartPicker(false);
                    setStartDate(date);
                }}
                onCancel={() => setShowStartPicker(false)}
                title="Select Start Date"
                confirmText="Confirm"
                cancelText="Cancel"
            />
            <DatePicker
                modal
                open={showEndPicker}
                date={endDate}
                mode="date"
                minimumDate={startDate}
                onConfirm={(date) => {
                    setShowEndPicker(false);
                    setEndDate(date);
                }}
                onCancel={() => setShowEndPicker(false)}
                title="Select End Date"
                confirmText="Confirm"
                cancelText="Cancel"
            />
        </TrueSheet>
    );
});

AddTripSheet.displayName = 'AddTripSheet';

export default AddTripSheet;

