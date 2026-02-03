import React from 'react';
import {TouchableOpacity, View} from "react-native";
import {CameraIcon, PencilIcon, QrCodeIcon} from "lucide-react-native";
import {ThemedText} from "../ThemedText";
import {useTheme} from "../../theme";
import {TripDetails} from "../../hooks/useTrips";

type TripActionButtonPanelProps = {
    trip: TripDetails
}
const TripActionButtonPanel = ({trip}: TripActionButtonPanelProps) => {
    const {colors} = useTheme();

    return (
        <>
            <View className={"flex-row justify-evenly my-2 items-center"}>
                <TouchableOpacity
                >
                    <View className={"flex-row items-center mt-2 gap-2"}>
                        <CameraIcon color={colors.textTertiary}/>
                    </View>
                </TouchableOpacity>
                <ThemedText style={{color: colors.divider}} textStyle={"caption"}>|</ThemedText>
                <TouchableOpacity
                    // onPress={() => navigation.navigate('TripHome', {tripId: trip.id, title: trip.name})}
                >
                    <View className={"flex-row items-center mt-2 gap-2"}>
                        <PencilIcon color={colors.textTertiary}/>
                    </View>
                </TouchableOpacity>
                <ThemedText style={{color: colors.divider}} textStyle={"caption"}>|</ThemedText>
                <TouchableOpacity
                    // onPress={() => navigation.navigate('TripHome', {tripId: trip.id, title: trip.name})}
                >
                    <View className={"flex-row items-center mt-2 gap-2"}>
                        <QrCodeIcon color={colors.divider}/>
                    </View>
                </TouchableOpacity>
            </View>
        </>
    );
};

export default TripActionButtonPanel;
