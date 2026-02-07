import React from 'react';

import {View} from 'react-native';
import {GlassButton} from "./GlassButton";
import {CheckIcon, XIcon} from "lucide-react-native";
import {useTheme} from "../../theme";
import {useRouter} from "expo-router";

type ConfirmGlassButtonBarProps = {
    onConfirm: () => void;
    disabled: boolean;
}

const ConfirmGlassButtonBar = ({onConfirm, disabled}: ConfirmGlassButtonBarProps) => {
    const {colors} = useTheme();
    const router = useRouter();

    return (
        <View className="flex-row justify-between p-5 my-3">
            {/* Glass Action Buttons */}
            <GlassButton
                icon={
                    <XIcon size={30} color={colors.textSecondary}/>
                }
                onPress={() => {
                    router.back();
                }}
            />
            <GlassButton
                icon={
                    <CheckIcon size={30} color={colors.textSecondary}/>
                }
                onPress={onConfirm}
                disabled={disabled}
            />
        </View>
    );
};

export default ConfirmGlassButtonBar;
