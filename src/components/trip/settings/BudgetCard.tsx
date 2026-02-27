/**
 * BudgetCard — Switch to enable budget + Slider to set the amount.
 */
import React from 'react';
import {Switch, View} from 'react-native';
import Slider from '@react-native-community/slider';
import {useTheme} from '../../../theme';
import {ThemedCard, ThemedText} from '../../index';
import {getCurrencySymbol} from '../../../constants/currencies';

interface Props {
    hasBudget: boolean;
    onToggle: (v: boolean) => void;
    budgetValue: number;
    onBudgetChange: (v: number) => void;
    currency: string;
}

export function BudgetCard({hasBudget, onToggle, budgetValue, onBudgetChange, currency}: Props) {
    const {colors} = useTheme();
    const symbol = getCurrencySymbol(currency);

    return (
        <ThemedCard>
            {/* Toggle row */}
            <View className="flex-row items-center justify-between">
                <ThemedText textStyle="content">Budget</ThemedText>
                <Switch
                    value={hasBudget}
                    onValueChange={onToggle}
                    trackColor={{false: colors.border, true: colors.primary}}
                    thumbColor={hasBudget ? colors.primary : colors.surface}
                />
            </View>

            {/* Slider — only visible when budget is on */}
            {hasBudget && (
                <View className="mt-3">
                    <ThemedText
                        textStyle="caption"
                        className="text-center text-[28px] font-semibold mb-1"
                    >
                        {symbol}{budgetValue.toLocaleString()}
                    </ThemedText>
                    <Slider
                        style={{width: '100%', height: 40}}
                        minimumValue={10000}
                        maximumValue={1000000}
                        step={10000}
                        value={budgetValue}
                        onValueChange={onBudgetChange}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                    />
                    <View className="flex-row justify-between px-1">
                        <ThemedText variant="tertiary" textStyle="placeholder">10,000</ThemedText>
                        <ThemedText variant="tertiary" textStyle="placeholder">1,000,000</ThemedText>
                    </View>
                </View>
            )}
        </ThemedCard>
    );
}

