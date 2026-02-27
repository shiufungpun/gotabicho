import React, {useRef} from 'react';
import {Alert, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {PencilIcon, TrashIcon, UsersIcon} from 'lucide-react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {useTripDetails} from '../../../src/hooks/useTripDetails';
import {deleteTrip} from '../../../src/repositories/tripRepository';
import {useTheme} from '../../../src/theme';
import {SettingsButtonCard, ThemedView} from '../../../src/components';
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
                <SettingsButtonCard
                    icon={<PencilIcon size={20} color={colors.text}/>}
                    label="修改行程"
                    onPress={() => editSheetRef.current?.present()}
                />

                <SettingsButtonCard
                    icon={<UsersIcon size={20} color={colors.text}/>}
                    label="管理旅伴"
                    onPress={() => router.push(`/trip/${tripId}/edit-participants`)}
                />

                <SettingsButtonCard
                    icon={<TrashIcon size={20} color={colors.error}/>}
                    label="刪除行程"
                    onPress={handleDelete}
                    destructive
                    showChevron={false}
                />
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
