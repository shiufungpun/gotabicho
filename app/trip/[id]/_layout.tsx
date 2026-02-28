import {Stack, useLocalSearchParams} from 'expo-router';
import {Icon, Label, NativeTabs} from 'expo-router/unstable-native-tabs';
import {useTripDetails} from '../../../src/hooks/useTripDetails';

export default function TripLayout() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const tripId = parseInt(id || '0');
    const {trip} = useTripDetails(tripId);

    const MAX_TITLE_LENGTH = 10;
    const headerTitle = trip?.name
        ? (trip.name.length > MAX_TITLE_LENGTH ? trip.name.slice(0, MAX_TITLE_LENGTH) + '…' : trip.name)
        : '';

    return (
        <>
            <Stack.Screen options={{title: headerTitle}}/>
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
        </>
    );
}
