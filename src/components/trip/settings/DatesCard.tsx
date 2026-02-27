/**
 * DatesCard — Start date and end date pickers (modal).
 */
import React from 'react';
import {TouchableOpacity} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useTheme} from '../../../theme';
import {ThemedCard, ThemedText} from '../../index';
import {SectionLabel} from './SectionLabel';

interface Props {
    startDate: Date;
    endDate: Date;
    showStartPicker: boolean;
    showEndPicker: boolean;
    onStartPress: () => void;
    onEndPress: () => void;
    onStartConfirm: (d: Date) => void;
    onEndConfirm: (d: Date) => void;
    onStartCancel: () => void;
    onEndCancel: () => void;
}

const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

export function DatesCard({
                              startDate, endDate,
                              showStartPicker, showEndPicker,
                              onStartPress, onEndPress,
                              onStartConfirm, onEndConfirm,
                              onStartCancel, onEndCancel,
                          }: Props) {
    const {colors} = useTheme();

    return (
        <>
            <ThemedCard>
                <SectionLabel>Start Date</SectionLabel>
                <TouchableOpacity
                    className="border rounded-xl px-4 py-4 items-center"
                    style={{borderColor: colors.border, backgroundColor: colors.surface}}
                    onPress={onStartPress}
                >
                    <ThemedText textStyle="body">{formatDate(startDate)}</ThemedText>
                </TouchableOpacity>

                <SectionLabel className="mt-4">End Date</SectionLabel>
                <TouchableOpacity
                    className="border rounded-xl px-4 py-4 items-center"
                    style={{borderColor: colors.border, backgroundColor: colors.surface}}
                    onPress={onEndPress}
                >
                    <ThemedText textStyle="body">{formatDate(endDate)}</ThemedText>
                </TouchableOpacity>
            </ThemedCard>

            {/* Date pickers rendered outside the card so they float above everything */}
            <DatePicker
                modal
                open={showStartPicker}
                date={startDate}
                mode="date"
                title="Select Start Date"
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={onStartConfirm}
                onCancel={onStartCancel}
            />
            <DatePicker
                modal
                open={showEndPicker}
                date={endDate}
                mode="date"
                minimumDate={startDate}
                title="Select End Date"
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={onEndConfirm}
                onCancel={onEndCancel}
            />
        </>
    );
}

