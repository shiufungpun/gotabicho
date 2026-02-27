import {useLocalSearchParams} from 'expo-router';
import {useTheme} from '../../../src/theme';
import {Icon, Label, NativeTabs} from 'expo-router/unstable-native-tabs';

export default function TripLayout() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const {colors} = useTheme();

    return (
        <NativeTabs>
            <NativeTabs.Trigger name="index">
                <Label>支出</Label>
                <Icon sf="yensign.gauge.chart.lefthalf.righthalf" drawable="home"/>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="bookmarks">
                <Icon sf="bookmark" drawable="bookmarks"/>
                <Label>收藏</Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="settings">
                <Icon sf="gear" drawable="settings"/>
                <Label>設定</Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
