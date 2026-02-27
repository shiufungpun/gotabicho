import React, {useRef} from 'react';
import {Alert, TouchableOpacity, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {ChevronRightIcon, PencilIcon, TrashIcon, UsersIcon} from 'lucide-react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {useTripDetails} from '../../../src/hooks/useTripDetails';
import {deleteTrip} from '../../../src/repositories/tripRepository';
import {useTheme} from '../../../src/theme';
import {ThemedCard, ThemedText, ThemedView} from '../../../src/components';
import {EditTripSheet} from '../../../src/components/trip/settings';

export default function TripSettingsScreen() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const tripId = parseInt(id || '0');
    const {trip, refresh} = useTripDetails(tripId);
    const {colors} = useTheme();
    const router = useRouter();
    const editSheetRef = useRef<TrueSheet>(null);

    const handleDelete = () => {
        Alert.alert(
            'Delete Trip',
            `Are you sure you want to delete "${trip?.name}"? This action cannot be undone.`,
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTrip(tripId);
                            router.dismissAll();
                        } catch {
                            Alert.alert('Error', 'Failed to delete trip.');
                        }
                    },
                },
            ],
        );
    };

    return (
        <ThemedView className="flex-1">
            <View className="px-4 pt-4 gap-3">
                {/* Edit Trip */}
                <ThemedCard>
                    <TouchableOpacity
                        className="flex-row items-center justify-between"
                        onPress={() => editSheetRef.current?.present()}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center gap-3">
                            <PencilIcon size={20} color={colors.primary}/>
                            <ThemedText textStyle="content">Edit Trip</ThemedText>
                        </View>
                        <ChevronRightIcon size={18} color={colors.textTertiary}/>
                    </TouchableOpacity>
                </ThemedCard>

                {/* Manage Participants */}
                <ThemedCard>
                    <TouchableOpacity
                        className="flex-row items-center justify-between"
                        onPress={() => router.push(`/trip/${tripId}/edit-participants`)}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center gap-3">
                            <UsersIcon size={20} color={colors.primary}/>
                            <ThemedText textStyle="content">Manage Participants</ThemedText>
                        </View>
                        <ChevronRightIcon size={18} color={colors.textTertiary}/>
                    </TouchableOpacity>
                </ThemedCard>

                {/* Delete Trip */}
                <ThemedCard>
                    <TouchableOpacity
                        className="flex-row items-center gap-3"
                        onPress={handleDelete}
                        activeOpacity={0.7}
                    >
                        <TrashIcon size={20} color={colors.error}/>
                        <ThemedText textStyle="content" variant="error">Delete Trip</ThemedText>
                    </TouchableOpacity>
                </ThemedCard>
            </View>

            {/* Edit Trip sheet */}
            <EditTripSheet
                ref={editSheetRef}
                trip={trip}
                onSaved={refresh}
            />
        </ThemedView>
    );
}
