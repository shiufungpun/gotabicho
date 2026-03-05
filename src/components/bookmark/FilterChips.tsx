import React from 'react';
import {ScrollView, TouchableOpacity} from 'react-native';
import {ThemedText} from '../index';
import {useTheme} from '../../theme';

interface FilterChipsProps {
    options: string[] | Record<string, string>;
    selected: string;
    onChange: (value: string) => void;
}

/** Normalise options into [{key, label}] regardless of input shape */
function normaliseOptions(options: string[] | Record<string, string>): { key: string; label: string }[] {
    if (Array.isArray(options)) {
        return options.map(o => ({key: o, label: o}));
    }
    return Object.entries(options).map(([key, label]) => ({key, label}));
}

export function FilterChips({options, selected, onChange}: FilterChipsProps) {
    const {colors} = useTheme();
    const items = normaliseOptions(options);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 16, paddingVertical: 8, gap: 8}}
        >
            {items.map(({key, label}) => {
                const isActive = key === selected;
                return (
                    <TouchableOpacity
                        key={key}
                        onPress={() => onChange(key)}
                        style={{
                            backgroundColor: isActive ? colors.primary : colors.card,
                            borderColor: isActive ? colors.primary : colors.border,
                        }}
                        className={"px-4 py-2 border rounded-full"}
                    >
                        <ThemedText
                            textStyle="number"
                            style={{
                                fontWeight: '500',
                                color: isActive ? '#ffffff' : colors.textSecondary,
                                textTransform: "capitalize"
                            }}
                        >
                            {label}
                        </ThemedText>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}
