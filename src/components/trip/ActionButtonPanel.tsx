import React from 'react';
import {TouchableOpacity, View, ViewProps} from "react-native";
import {CameraIcon, PencilIcon, QrCodeIcon} from "lucide-react-native";
import {ThemedText} from "../ThemedText";
import {useTheme} from "../../theme";
import {TripDetails} from "../../hooks/useTrips";

interface TripActionButtonPanelProps extends ViewProps {
    trip: TripDetails
}

const TripActionButtonPanel = ({trip, ...props}: TripActionButtonPanelProps) => {
    const {colors} = useTheme();
    return (
        <View {...props} className={""}>
            <View className={"flex-row justify-evenly mt-2 py-2 pt-2 items-center border-t-[1px] w-full"}
                  style={{borderColor: colors.divider}}
            >
                <TouchableOpacity
                >
                    <View className={"flex-row items-center gap-2"}>
                        <CameraIcon color={colors.textTertiary}/>
                    </View>
                </TouchableOpacity>
                <ThemedText style={{color: colors.divider}} textStyle={"caption"}>|</ThemedText>
                <TouchableOpacity
                    // onPress={() => navigation.navigate('TripHome', {tripId: trip.id, title: trip.name})}
                >
                    <View className={"flex-row items-center gap-2"}>
                        <PencilIcon color={colors.textTertiary}/>
                    </View>
                </TouchableOpacity>
                <ThemedText style={{color: colors.divider}} textStyle={"caption"}>|</ThemedText>
                <TouchableOpacity
                    // onPress={() => navigation.navigate('TripHome', {tripId: trip.id, title: trip.name})}
                >
                    <View className={"flex-row items-center gap-2"}>
                        <QrCodeIcon color={colors.divider}/>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TripActionButtonPanel;
