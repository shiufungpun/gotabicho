/**
 * TripInfoCard — editable trip name + currency picker.
 */
import React from 'react';
import {TextInput, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useTheme} from '../../../theme';
import {ThemedCard} from '../../index';
import {CURRENCIES} from '../../../constants/currencies';
import {SectionLabel} from './SectionLabel';

interface Props {
    name: string;
    onNameChange: (v: string) => void;
    currency: string;
    onCurrencyChange: (v: string) => void;
}

export function TripInfoCard({name, onNameChange, currency, onCurrencyChange}: Props) {
    const {colors} = useTheme();

    return (
        <ThemedCard>
            {/* Trip name */}
            <SectionLabel>Trip Name</SectionLabel>
            <TextInput
                className="border rounded-xl px-4 py-3 text-lg font-hina"
                style={{borderColor: colors.border, color: colors.text, backgroundColor: colors.surface}}
                value={name}
                onChangeText={onNameChange}
                placeholder="e.g. Hokkaido Ski Trip"
                placeholderTextColor={colors.textTertiary}
            />

            {/* Base currency */}
            <SectionLabel className="mt-4">Base Currency</SectionLabel>
            <View
                className="border rounded-xl overflow-hidden"
                style={{borderColor: colors.border, backgroundColor: colors.surface}}
            >
                <Picker
                    selectedValue={currency}
                    onValueChange={onCurrencyChange}
                    style={{color: colors.text}}
                    dropdownIconColor={colors.textSecondary}
                    itemStyle={{color: colors.text}}
                >
                    {CURRENCIES.map(c => (
                        <Picker.Item key={c.value} label={c.label} value={c.value}/>
                    ))}
                </Picker>
            </View>
        </ThemedCard>
    );
}

