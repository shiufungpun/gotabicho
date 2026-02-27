/**
 * SettingsButtonCard — a tappable card row used on settings screens.
 * Shows a leading icon, a label, and an optional trailing chevron.
 */
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {ChevronRightIcon} from 'lucide-react-native';
import {useTheme} from '../../theme';
import {ThemedText} from '../ThemedText';

interface SettingsButtonCardProps {
    /** Icon element rendered on the left */
    icon: React.ReactNode;
    /** Row label */
    label: string;
    /** Called when the row is tapped */
    onPress: () => void;
    /** When true the label and icon are rendered in the error/destructive colour */
    destructive?: boolean;
    /** Hide the trailing chevron (e.g. for destructive actions) */
    showChevron?: boolean;
}

export function SettingsButtonCard({
                                       icon,
                                       label,
                                       onPress,
                                       destructive = false,
                                       showChevron = true,
                                   }: SettingsButtonCardProps) {
    const {colors} = useTheme();
    const labelColor = destructive ? colors.error : undefined;

    return (
        <View>
            <TouchableOpacity
                className="flex-row items-center justify-between py-2"
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center gap-3">
                    {icon}
                    <ThemedText
                        textStyle="body"
                        variant={destructive ? 'error' : 'primary'}
                        style={labelColor ? {color: labelColor} : undefined}
                    >
                        {label}
                    </ThemedText>
                </View>
                {showChevron && (
                    <ChevronRightIcon size={18} color={colors.textTertiary}/>
                )}
            </TouchableOpacity>
        </View>
    );
}

