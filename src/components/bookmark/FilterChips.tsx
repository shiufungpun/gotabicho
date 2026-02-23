import React from 'react';
import {ScrollView, TouchableOpacity} from 'react-native';
import {ThemedText} from '../index';
import {useTheme} from '../../theme';

interface FilterChipsProps {
    options: string[];
    selected: string;
    onChange: (value: string) => void;
}

export function FilterChips({options, selected, onChange}: FilterChipsProps) {
    const {colors} = useTheme();

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 16, paddingVertical: 8, gap: 8}}
        >
            {options.map(option => {
                const isActive = option === selected;
                return (
                    <TouchableOpacity
                        key={option}
                        onPress={() => onChange(option)}
                        style={{
                            backgroundColor: isActive ? colors.primary : colors.card,
                            borderRadius: 20,
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderWidth: 1,
                            borderColor: isActive ? colors.primary : colors.border,
                        }}
                    >
                        <ThemedText
                            textStyle="body"
                            style={{
                                fontSize: 13,
                                fontWeight: '500',
                                color: isActive ? '#ffffff' : colors.textSecondary,
                            }}
                        >
                            {option}
                        </ThemedText>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

