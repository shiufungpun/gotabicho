/**
 * TripBudgetCard — toggle + slider for optional trip budget.
 */
import React from 'react';
import {Switch, View} from 'react-native';
import Slider from '@react-native-community/slider';
import {useTheme} from '../../../theme';
import {ThemedCard, ThemedText} from '../../index';
import {getCurrencySymbol} from '../../../constants/currencies';

interface TripBudgetCardProps {
    hasBudget: boolean;
    onHasBudgetChange: (v: boolean) => void;
    budgetValue: number;
    onBudgetValueChange: (v: number) => void;
    currency: string;
}

export function TripBudgetCard({
                                   hasBudget,
                                   onHasBudgetChange,
                                   budgetValue,
                                   onBudgetValueChange,
                                   currency,
                               }: TripBudgetCardProps) {
    const {colors} = useTheme();
    const symbol = getCurrencySymbol(currency);

    return (
        <ThemedCard>
            {/* Toggle row */}
            <View className="flex-row items-center justify-between">
                <View>
                    <ThemedText variant="secondary" textStyle="body" className="uppercase tracking-widest text-xs">
                        Budget
                    </ThemedText>
                    {hasBudget && (
                        <ThemedText
                            style={{fontSize: 24, fontWeight: '700', marginTop: 2, color: colors.primary}}
                        >
                            {symbol}{budgetValue.toLocaleString()}
                        </ThemedText>
                    )}
                </View>
                <Switch
                    value={hasBudget}
                    onValueChange={onHasBudgetChange}
                    trackColor={{false: colors.border, true: colors.primary}}
                    thumbColor={hasBudget ? '#fff' : '#fff'}
                />
            </View>

            {/* Slider — only when enabled */}
            {hasBudget && (
                <View className="mt-4">
                    <Slider
                        style={{width: '100%', height: 36}}
                        minimumValue={10000}
                        maximumValue={1000000}
                        step={10000}
                        value={budgetValue}
                        onValueChange={onBudgetValueChange}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                    />
                    <View className="flex-row justify-between px-1 mt-1">
                        <ThemedText variant="tertiary" style={{fontSize: 11}}>
                            {symbol}10,000
                        </ThemedText>
                        <ThemedText variant="tertiary" style={{fontSize: 11}}>
                            {symbol}1,000,000
                        </ThemedText>
                    </View>
                </View>
            )}
        </ThemedCard>
    );
}

