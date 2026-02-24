import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import MapView, {Marker, Region} from 'react-native-maps';
import * as Location from 'expo-location';

export interface MapPin {
    id: number;
    coordinate: { latitude: number; longitude: number };
    color: string;
}

interface MapPinsViewProps {
    pins: MapPin[];
    selectedId: number | null;
    onPinPress: (id: number) => void;
}

const TOKYO_REGION: Region = {
    latitude: 35.6762,
    longitude: 139.6503,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
};

export function MapPinsView({pins, selectedId, onPinPress}: MapPinsViewProps) {
    const mapRef = useRef<MapView>(null);
    const [initialRegion, setInitialRegion] = useState<Region>(TOKYO_REGION);
    const [locationReady, setLocationReady] = useState(false);

    // Request device location on mount and use it as initial region
    useEffect(() => {
        (async () => {
            try {
                const {status} = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    setInitialRegion({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                        latitudeDelta: 0.12,
                        longitudeDelta: 0.12,
                    });
                }
            } catch {
                // Permission denied or unavailable — keep Tokyo fallback
            } finally {
                setLocationReady(true);
            }
        })();
    }, []);

    // Animate to show all pins when they change
    useEffect(() => {
        if (!locationReady || pins.length === 0 || !mapRef.current) return;

        if (pins.length === 1) {
            mapRef.current.animateToRegion(
                {
                    latitude: pins[0].coordinate.latitude,
                    longitude: pins[0].coordinate.longitude,
                    latitudeDelta: 0.06,
                    longitudeDelta: 0.06,
                },
                400,
            );
        } else {
            mapRef.current.fitToCoordinates(
                pins.map(p => p.coordinate),
                {
                    edgePadding: {top: 48, right: 48, bottom: 48, left: 48},
                    animated: true,
                },
            );
        }
    }, [pins, locationReady]);

    // Animate to selected pin when selection changes
    useEffect(() => {
        if (!selectedId || !mapRef.current) return;
        const pin = pins.find(p => p.id === selectedId);
        if (!pin) return;

        mapRef.current.animateToRegion(
            {
                latitude: pin.coordinate.latitude,
                longitude: pin.coordinate.longitude,
                latitudeDelta: 0.06,
                longitudeDelta: 0.06,
            },
            300,
        );
    }, [selectedId]);

    if (!locationReady) {
        // Render map with Tokyo region while awaiting location
        return (
            <MapView
                style={styles.map}
                initialRegion={TOKYO_REGION}
                showsUserLocation
            />
        );
    }

    return (
        <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton={false}
        >
            {pins.map(pin => {
                const isSelected = pin.id === selectedId;
                return (
                    <Marker
                        key={pin.id}
                        coordinate={pin.coordinate}
                        onPress={() => onPinPress(pin.id)}
                        anchor={{x: 0.5, y: 0.5}}
                        tracksViewChanges={false}
                    >
                        {/* Custom circular pin — no label text */}
                        <View style={[
                            styles.pin,
                            {
                                backgroundColor: pin.color,
                                width: isSelected ? 22 : 14,
                                height: isSelected ? 22 : 14,
                                borderRadius: isSelected ? 11 : 7,
                                borderWidth: isSelected ? 3 : 2,
                                borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)',
                            },
                        ]}/>
                    </Marker>
                );
            })}
        </MapView>
    );
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
    pin: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 3,
        shadowOffset: {width: 0, height: 1},
        elevation: 3,
    },
});
