import React from 'react';
import {View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {GlassButton} from '../../components';
import {MapPin, MapPinsView} from '../../components/bookmark/MapPinsView';

interface BookmarkMapContainerProps {
    pins: MapPin[];
    selectedId: number | null;
    onPinPress: (id: number) => void;
    onOpenSheet: () => void;
}

export function BookmarkMapContainer({
                                         pins,
                                         selectedId,
                                         onPinPress,
                                         onOpenSheet,
                                     }: BookmarkMapContainerProps) {
    const insets = useSafeAreaInsets();

    return (
        <>
            {/* Full-screen map background */}
            <View className="absolute inset-0">
                <MapPinsView
                    pins={pins}
                    selectedId={selectedId}
                    onPinPress={onPinPress}
                />
            </View>

            {/* Floating glass button to open the bottom sheet */}
            <View
                style={{
                    position: 'absolute',
                    bottom: insets.bottom + 63,
                    alignSelf: 'center',
                }}
            >
                <GlassButton
                    icon={<Ionicons name="menu" size={22} color="#000"/>}
                    onPress={onOpenSheet}
                />
            </View>
        </>
    );
}

