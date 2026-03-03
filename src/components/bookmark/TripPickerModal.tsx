import React, {useState} from 'react';
import {Modal, Pressable, ScrollView, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ThemedText} from '../index';
import {useTheme} from '../../theme';
import {TripDetails} from '../../hooks/useTrips';

interface TripPickerModalProps {
    visible: boolean;
    trips: TripDetails[];
    onConfirm: (tripIds: number[]) => void;
    onCancel: () => void;
}

export function TripPickerModal({visible, trips, onConfirm, onCancel}: TripPickerModalProps) {
    const {colors} = useTheme();
    const [selectedTripIds, setSelectedTripIds] = useState<number[]>([]);

    const toggleTrip = (id: number) => {
        setSelectedTripIds(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id],
        );
    };

    const handleConfirm = () => {
        onConfirm(selectedTripIds);
        setSelectedTripIds([]);
    };

    const handleCancel = () => {
        setSelectedTripIds([]);
        onCancel();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={handleCancel}>
            <Pressable
                style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'}}
                onPress={handleCancel}
            >
                <Pressable onPress={() => {
                }}>
                    <View
                        style={{
                            backgroundColor: colors.surface,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            paddingHorizontal: 20,
                            paddingTop: 16,
                            paddingBottom: 36,
                            maxHeight: '70%',
                        }}
                    >
                        {/* Handle bar */}
                        <View
                            style={{
                                width: 40,
                                height: 4,
                                backgroundColor: colors.border,
                                borderRadius: 2,
                                alignSelf: 'center',
                                marginBottom: 16,
                            }}
                        />

                        <ThemedText textStyle="title" style={{marginBottom: 4}}>
                            Add to Trip
                        </ThemedText>
                        <ThemedText variant="secondary" style={{fontSize: 13, marginBottom: 16}}>
                            Select one or more trips
                        </ThemedText>

                        {trips.length === 0 ? (
                            <View className="items-center py-8">
                                <Ionicons name="map-outline" size={40} color={colors.textTertiary}/>
                                <ThemedText variant="tertiary" className="text-center mt-2 text-sm">
                                    No trips yet. Create a trip first.
                                </ThemedText>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight: 360}}>
                                <View style={{gap: 8}}>
                                    {trips.map(trip => {
                                        const isSelected = selectedTripIds.includes(trip.id);
                                        return (
                                            <TouchableOpacity
                                                key={trip.id}
                                                onPress={() => toggleTrip(trip.id)}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    padding: 14,
                                                    borderRadius: 14,
                                                    borderWidth: 1.5,
                                                    borderColor: isSelected ? colors.primary : colors.border,
                                                    backgroundColor: isSelected ? colors.primaryLight : colors.card,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: 22,
                                                        height: 22,
                                                        borderRadius: 11,
                                                        borderWidth: 2,
                                                        borderColor: isSelected ? colors.primary : colors.border,
                                                        backgroundColor: isSelected ? colors.primary : 'transparent',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: 12,
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <Ionicons name="checkmark" size={13} color="#fff"/>
                                                    )}
                                                </View>
                                                <View style={{flex: 1}}>
                                                    <ThemedText
                                                        textStyle="body"
                                                        style={{fontWeight: '600'}}
                                                        numberOfLines={1}
                                                    >
                                                        {trip.name}
                                                    </ThemedText>
                                                    {trip.start_date && trip.end_date ? (
                                                        <ThemedText variant="tertiary"
                                                                    style={{fontSize: 12, marginTop: 2}}>
                                                            {trip.start_date} – {trip.end_date}
                                                        </ThemedText>
                                                    ) : null}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        )}

                        {/* Action buttons */}
                        <View className="flex-row gap-x-3 mt-5">
                            <TouchableOpacity
                                onPress={handleCancel}
                                style={{
                                    flex: 1,
                                    paddingVertical: 13,
                                    borderRadius: 50,
                                    borderWidth: 1.5,
                                    borderColor: colors.border,
                                    alignItems: 'center',
                                }}
                            >
                                <ThemedText textStyle="body" style={{fontWeight: '600'}}>Cancel</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleConfirm}
                                disabled={selectedTripIds.length === 0 || trips.length === 0}
                                style={{
                                    flex: 2,
                                    paddingVertical: 13,
                                    borderRadius: 50,
                                    backgroundColor:
                                        selectedTripIds.length === 0 || trips.length === 0
                                            ? colors.border
                                            : colors.primary,
                                    alignItems: 'center',
                                }}
                            >
                                <ThemedText
                                    style={{
                                        fontWeight: '700',
                                        fontSize: 15,
                                        color: selectedTripIds.length === 0 ? colors.textTertiary : '#fff',
                                    }}
                                >
                                    {selectedTripIds.length > 0
                                        ? `Add to ${selectedTripIds.length} trip${selectedTripIds.length > 1 ? 's' : ''}`
                                        : 'Add to Trip'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

