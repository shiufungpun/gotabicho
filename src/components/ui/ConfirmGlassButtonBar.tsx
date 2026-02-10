import React from 'react';

import {View} from 'react-native';
import {GlassButton} from "./GlassButton";
import {CheckIcon, XIcon} from "lucide-react-native";
import {useTheme} from "../../theme";
import {ThemedText} from "../ThemedText";

type ConfirmGlassButtonBarProps = {
    title?: string;
    onCancel: () => void;
    onConfirm: () => void;
    disabled: boolean;
}

const ConfirmGlassButtonBar = ({onConfirm, onCancel, disabled, title}: ConfirmGlassButtonBarProps) => {
    const {colors} = useTheme();

    return (
        <View className="flex-row justify-between p-3 m-2 ">
            {/* Glass Action Buttons */}
            <GlassButton
                icon={
                    <XIcon size={30} color={colors.text}/>
                }
                onPress={() => {
                    onCancel();
                }}
            />
            {title &&
                <ThemedText textStyle={"content"}>{title}</ThemedText>}
            <GlassButton
                icon={
                    <CheckIcon size={30} color={colors.text}/>
                }
                onPress={onConfirm}
                disabled={disabled}
            />
        </View>
    );
};

export default ConfirmGlassButtonBar;
