import {Icon, Label, NativeTabs} from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
    return (
        <NativeTabs>
            <NativeTabs.Trigger name="index">
                <Label>Home</Label>
                <Icon sf="house.fill" drawable="custom_android_drawable"/>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="bookmark">
                <Icon sf="bookmark" drawable="custom_settings_drawable"/>
                <Label>Bookmarks</Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="ai-test">
                <Icon sf="gear" drawable="custom_settings_drawable"/>
                <Label>Settings</Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}

