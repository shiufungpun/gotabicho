/**
 * CurrencyPickerModal — full-screen native modal with a 2-column currency grid.
 */
import React, {useState} from 'react';
import {FlatList, Modal, TextInput, TouchableOpacity, View,} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CheckIcon, SearchIcon, XIcon} from 'lucide-react-native';
import {useTheme} from '../../theme';
import {ThemedText} from '../ThemedText';
import {CURRENCIES, CurrencyOption} from '../../constants/currencies';

interface CurrencyPickerModalProps {
    visible: boolean;
    selected: string;
    onSelect: (code: string) => void;
    onClose: () => void;
}

export function CurrencyPickerModal({
                                        visible,
                                        selected,
                                        onSelect,
                                        onClose,
                                    }: CurrencyPickerModalProps) {
    const {colors} = useTheme();
    const [query, setQuery] = useState('');
    const insets = useSafeAreaInsets();

    const filtered = query.trim()
        ? CURRENCIES.filter(
            c =>
                c.value.toLowerCase().includes(query.toLowerCase()) ||
                c.label.toLowerCase().includes(query.toLowerCase()),
        )
        : CURRENCIES;

    const handleSelect = (code: string) => {
        onSelect(code);
        onClose();
    };

    const handleClose = () => {
        setQuery('');
        onClose();
    };

    const renderItem = ({item}: { item: CurrencyOption }) => {
        const isSelected = item.value === selected;
        return (
            <TouchableOpacity
                onPress={() => handleSelect(item.value)}
                activeOpacity={0.7}
                className="flex-1 m-2 rounded-2xl p-4 items-center"
                style={{
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? colors.primary : colors.border,
                    minHeight: 90,
                    justifyContent: 'center',
                }}
            >
                {/* Currency symbol — large */}
                <ThemedText
                    style={{
                        fontSize: 26,
                        fontWeight: '700',
                        color: isSelected ? colors.primary : colors.text,
                        lineHeight: 32,
                    }}
                >
                    {item.symbol}
                </ThemedText>

                {/* Currency code */}
                <ThemedText
                    style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: isSelected ? colors.primary : colors.text,
                        marginTop: 2,
                    }}
                >
                    {item.value}
                </ThemedText>

                {/* Currency name */}
                <ThemedText
                    variant="tertiary"
                    style={{fontSize: 11, marginTop: 1, textAlign: 'center'}}
                    numberOfLines={1}
                >
                    {item.label.split(' — ')[1] ?? item.label}
                </ThemedText>

                {/* Checkmark badge */}
                {isSelected && (
                    <View
                        className="absolute top-2 right-2 rounded-full p-0.5"
                        style={{backgroundColor: colors.primary}}
                    >
                        <CheckIcon size={10} color="#fff"/>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <View
                className="flex-1"
                style={{backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom}}
            >
                {/* Header */}
                <View
                    className="flex-row items-center justify-between px-5 py-4 border-b"
                    style={{borderBottomColor: colors.border}}
                >
                    <ThemedText textStyle="title" style={{fontSize: 18, fontWeight: '700'}}>
                        Select Currency
                    </ThemedText>
                    <TouchableOpacity onPress={handleClose} hitSlop={8}>
                        <XIcon size={22} color={colors.textSecondary}/>
                    </TouchableOpacity>
                </View>

                {/* Search bar */}
                <View className="px-4 pt-3 pb-2">
                    <View
                        className="flex-row items-center rounded-xl px-3 py-2 gap-x-2"
                        style={{backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border}}
                    >
                        <SearchIcon size={16} color={colors.textTertiary}/>
                        <TextInput
                            className="flex-1 text-base"
                            style={{color: colors.text, fontSize: 15}}
                            placeholder="Search currency..."
                            placeholderTextColor={colors.textTertiary}
                            value={query}
                            onChangeText={setQuery}
                            clearButtonMode="while-editing"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                {/* 2-column currency grid */}
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.value}
                    numColumns={2}
                    renderItem={renderItem}
                    contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 32}}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </Modal>
    );
}
