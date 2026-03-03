import React from 'react';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ThemedText} from '../index';
import {useTheme} from '../../theme';

interface SelectionActionBarProps {
    count: number;
    loading?: boolean;
    onAddToTrip: () => void;
    onDelete: () => void;
    onCancel: () => void;
}

export function SelectionActionBar({
                                       count,
                                       loading = false,
                                       onAddToTrip,
                                       onDelete,
                                       onCancel,
                                   }: SelectionActionBarProps) {
    const {colors} = useTheme();

    return (
        <View
            className="items-center pb-4 pt-2"
            pointerEvents="box-none"
        >
            <View
                className="flex-row items-center gap-x-2 px-3 py-2 rounded-full"
                style={{
                    backgroundColor: colors.surface,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.18,
                    shadowRadius: 10,
                    elevation: 8,
                }}
            >
                {/* Count badge */}
                <View
                    style={{
                        backgroundColor: colors.primary,
                        borderRadius: 50,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        minWidth: 32,
                        alignItems: 'center',
                    }}
                >
                    <ThemedText style={{color: '#fff', fontWeight: '700', fontSize: 13}}>
                        {count}
                    </ThemedText>
                </View>

                {/* Add to Trip pill */}
                <TouchableOpacity
                    onPress={onAddToTrip}
                    disabled={loading}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        backgroundColor: colors.primary,
                        borderRadius: 50,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff"/>
                    ) : (
                        <Ionicons name="add-circle-outline" size={16} color="#fff"/>
                    )}
                    <ThemedText style={{color: '#fff', fontWeight: '600', fontSize: 13}}>
                        Add to Trip
                    </ThemedText>
                </TouchableOpacity>

                {/* Delete pill */}
                <TouchableOpacity
                    onPress={onDelete}
                    disabled={loading}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        backgroundColor: colors.error,
                        borderRadius: 50,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    <Ionicons name="trash-outline" size={15} color="#fff"/>
                    <ThemedText style={{color: '#fff', fontWeight: '600', fontSize: 13}}>
                        Delete
                    </ThemedText>
                </TouchableOpacity>

                {/* Cancel pill */}
                <TouchableOpacity
                    onPress={onCancel}
                    disabled={loading}
                    style={{
                        borderRadius: 50,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: colors.divider,
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    <Ionicons name="close" size={16} color={colors.textSecondary}/>
                </TouchableOpacity>
            </View>
        </View>
    );
}

