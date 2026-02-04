import {Tabs, useLocalSearchParams} from 'expo-router';
import {Text} from 'react-native';
import {useTheme} from '../../../src/theme';

export default function TripLayout() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const {colors} = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Expenses',
                    tabBarIcon: ({color}) => <Text style={{color}}>📊</Text>
                }}
            />
            <Tabs.Screen
                name="participants"
                options={{
                    title: 'Participants',
                    tabBarIcon: ({color}) => <Text style={{color}}>👥</Text>
                }}
            />
            <Tabs.Screen
                name="settlement"
                options={{
                    title: 'Settlement',
                    tabBarIcon: ({color}) => <Text style={{color}}>🤝</Text>
                }}
            />
        </Tabs>
    );
}
