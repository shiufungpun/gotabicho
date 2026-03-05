/**
 * TripCurrencyCard — tappable currency selector that opens CurrencyPickerModal.
 */
import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {ChevronRightIcon} from 'lucide-react-native';
import {useTheme} from '../../../theme';
import {ThemedCard, ThemedText} from '../../index';
import {CurrencyPickerModal} from '../../ui/CurrencyPickerModal';
import {CURRENCIES} from '../../../constants/currencies';

interface TripCurrencyCardProps {
    value: string;
    onChange: (code: string) => void;
}

export function TripCurrencyCard({value, onChange}: TripCurrencyCardProps) {
    const {colors} = useTheme();
    const [modalVisible, setModalVisible] = useState(false);

    const selected = CURRENCIES.find(c => c.value === value) ?? CURRENCIES[0];

    return (
        <>
            <ThemedCard>
                <ThemedText variant="secondary" textStyle="body" className="mb-3 uppercase tracking-widest text-xs">
                    Currency
                </ThemedText>

                {/* Tappable row */}
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between rounded-2xl px-4 py-3 border"
                    style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    }}
                >
                    {/* Left: symbol + code */}
                    <View className="flex-row items-center gap-x-3">
                        <View
                            className="w-11 h-11 rounded-full items-center justify-center"
                            style={{backgroundColor: colors.primaryLight}}
                        >
                            <ThemedText
                                style={{
                                    fontSize: 18,
                                    fontWeight: '700',
                                    color: colors.primary,
                                }}
                            >
                                {selected.symbol}
                            </ThemedText>
                        </View>
                        <View>
                            <ThemedText style={{fontSize: 16, fontWeight: '600'}}>
                                {selected.value}
                            </ThemedText>
                            <ThemedText variant="secondary" style={{fontSize: 12, marginTop: 1}}>
                                {selected.label.split(' — ')[1] ?? selected.label}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Right: chevron */}
                    <ChevronRightIcon size={18} color={colors.textTertiary}/>
                </TouchableOpacity>
            </ThemedCard>

            <CurrencyPickerModal
                visible={modalVisible}
                selected={value}
                onSelect={onChange}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}

