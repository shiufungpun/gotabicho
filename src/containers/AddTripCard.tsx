import React from 'react';
import {TouchableOpacity} from 'react-native';
import {ThemedCard, ThemedText} from "../components";
import {useRouter} from "expo-router";

const AddTripCard: React.FC = () => {
    const router = useRouter();
    return (
        <ThemedCard className="p-4 rounded-lg h-full justify-center items-center">
            <TouchableOpacity
                onPress={() => router.push('/trip/add')}
            >
                <ThemedText textStyle={"header"} variant={"tertiary"} className={"text-2xl"}>旅</ThemedText>
            </TouchableOpacity>
        </ThemedCard>
    );
};

export default AddTripCard;
