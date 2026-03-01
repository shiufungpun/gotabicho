import {Icon, Label, NativeTabs} from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
    return (
        <NativeTabs>
            <NativeTabs.Trigger name="index">
                <Label>旅程</Label>
                <Icon sf="airplane.ticket" drawable="custom_android_drawable"/>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="bookmark">
                <Icon sf="bookmark" drawable="custom_settings_drawable"/>
                <Label>收藏</Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="ai-test">
                <Icon sf="gear" drawable="custom_settings_drawable"/>
                <Label>設定</Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}

