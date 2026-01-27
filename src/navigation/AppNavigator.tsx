import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {RouteProp, useRoute} from '@react-navigation/native';
import {Text} from 'react-native';

import TripListScreen from '../screens/TripListScreen';
import AddTripScreen from '../screens/AddTripScreen';
import TripExpensesScreen from '../screens/TripExpensesScreen';
import AddReceiptScreen from '../screens/AddReceiptScreen';
import ReceiptDetailScreen from '../screens/ReceiptDetailScreen';
import ParticipantListScreen from '../screens/ParticipantListScreen';
import SettlementScreen from '../screens/SettlementScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Types for params
export type RootStackParamList = {
    TripList: undefined;
    AddTrip: undefined;
    TripHome: { tripId: number; title: string };
    AddReceipt: { tripId: number };
    ReceiptDetail: { receiptId: number };
    TripExpenses: { tripId: number }; // For direct access if needed, or via Tab
};

function TripTabNavigator() {
    const route = useRoute<RouteProp<RootStackParamList, 'TripHome'>>();
    const {tripId, title} = route.params;

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#1565c0',
            }}
        >
            <Tab.Screen
                name="Expenses"
                component={TripExpensesScreen}
                initialParams={{tripId}}
                options={{tabBarIcon: ({color}) => <Text style={{color}}>📊</Text>}}
            />
            <Tab.Screen
                name="Participants"
                component={ParticipantListScreen}
                initialParams={{tripId}}
                options={{tabBarIcon: ({color}) => <Text style={{color}}>👥</Text>}}
            />
            <Tab.Screen
                name="Settlement"
                component={SettlementScreen}
                initialParams={{tripId}}
                options={{tabBarIcon: ({color}) => <Text style={{color}}>🤝</Text>}}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="TripList" component={TripListScreen} options={{headerShown: false}}/>
            <Stack.Screen name="AddTrip" component={AddTripScreen} options={{title: 'New Trip'}}/>
            <Stack.Screen
                name="TripHome"
                component={TripTabNavigator}
                options={({route}: any) => ({title: route.params.title})}
            />
            <Stack.Group screenOptions={{presentation: 'modal'}}>
                <Stack.Screen name="AddReceipt" component={AddReceiptScreen} options={{title: 'Add Receipt'}}/>
            </Stack.Group>
            <Stack.Screen name="ReceiptDetail" component={ReceiptDetailScreen} options={{title: 'Receipt Details'}}/>
        </Stack.Navigator>
    );
}
