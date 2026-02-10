import {useLocalSearchParams} from 'expo-router';
import {useTheme} from '../../../src/theme';
import {NativeTabs} from 'expo-router/unstable-native-tabs';

export default function TripLayout() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const {colors} = useTheme();

    return (
        <NativeTabs>
            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Label>支出</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="yensign.gauge.chart.lefthalf.righthalf" md="home"/>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="bookmarks">
                <NativeTabs.Trigger.Icon sf="bookmark" md="bookmarks"/>
                <NativeTabs.Trigger.Label>收藏</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="settings">
                <NativeTabs.Trigger.Icon sf="gear" md="settings"/>
                <NativeTabs.Trigger.Label>設定</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="searchReceipt" role={"search"}>
                <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
