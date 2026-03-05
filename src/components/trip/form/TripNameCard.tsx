/**
 * TripNameCard — reusable trip name input card.
 */
import React from 'react';
import {TextInput} from 'react-native';
import {useTheme} from '../../../theme';
import {ThemedCard, ThemedText} from '../../index';

interface TripNameCardProps {
    value: string;
    onChangeText: (v: string) => void;
}

export function TripNameCard({value, onChangeText}: TripNameCardProps) {
    const {colors} = useTheme();

    return (
        <ThemedCard>
            <ThemedText variant="secondary" textStyle="body" className="mb-2 uppercase tracking-widest text-xs">
                Trip Name
            </ThemedText>
            <TextInput
                className="border rounded-2xl px-4 py-3 text-base"
                style={{
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface,
                    fontSize: 16,
                }}
                value={value}
                onChangeText={onChangeText}
                placeholder="e.g. Hokkaido Ski Trip"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="done"
            />
        </ThemedCard>
    );
}

