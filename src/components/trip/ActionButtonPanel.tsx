import React from 'react';
import {TouchableOpacity, View, ViewProps} from "react-native";
import {CameraIcon, PencilIcon, QrCodeIcon} from "lucide-react-native";
import {ThemedText} from "../ThemedText";
import {useTheme} from "../../theme";
import {TripDetails} from "../../hooks/useTrips";
import {useRouter} from "expo-router";

interface TripActionButtonPanelProps extends ViewProps {
    trip: TripDetails
}

const TripActionButtonPanel = ({trip, ...props}: TripActionButtonPanelProps) => {
    const {colors} = useTheme();
    const router = useRouter();
    return (
        <View {...props} className={""}>
            <View className={"flex-row justify-evenly mt-2 py-2 pt-2 items-center border-t-[1px] w-full"}
                  style={{borderColor: colors.divider}}
            >
                <TouchableOpacity className={"w-20 items-center"}>
                    <CameraIcon color={colors.textTertiary}/>
                </TouchableOpacity>
                <ThemedText style={{color: colors.divider}} textStyle={"caption"}>|</ThemedText>
                <TouchableOpacity
                    className={"w-20 items-center"}
                    onPress={() => router.navigate(`/add-receipt?tripId=${trip.id}`)}
                >
                    <PencilIcon color={colors.textTertiary}/>
                </TouchableOpacity>
                <ThemedText style={{color: colors.divider}} textStyle={"caption"}>|</ThemedText>
                <TouchableOpacity
                    className={"w-20 items-center"}
                    // onPress={() => navigation.navigate('TripHome', {tripId: trip.id, title: trip.name})}
                >
                    <QrCodeIcon color={colors.divider}/>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TripActionButtonPanel;
