import React from 'react';
import {View} from 'react-native';
import {MapPin, MapPinsView} from '../../components/bookmark/MapPinsView';

interface BookmarkMapContainerProps {
    pins: MapPin[];
    selectedId: number | null;
    onPinPress: (id: number) => void;
}

export function BookmarkMapContainer({
                                         pins,
                                         selectedId,
                                         onPinPress,
                                     }: BookmarkMapContainerProps) {

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
        </>
    );
}

