import React from 'react';
import {TouchableOpacity} from 'react-native';
import {ThemedCard, ThemedText} from "../components";
import {useNavigation} from "@react-navigation/native";

const AddTripCard: React.FC = () => {
    const navigation = useNavigation<any>();
    return (
        <ThemedCard className="p-4 rounded-lg h-full justify-center items-center">
            <TouchableOpacity
                onPress={() => navigation.navigate('AddTrip')}
            >
                <ThemedText textStyle={"header"} variant={"tertiary"} className={"text-2xl"}>旅</ThemedText>
            </TouchableOpacity>
        </ThemedCard>
    );
};

export default AddTripCard;
