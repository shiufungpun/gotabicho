import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp, useRoute } from '@react-navigation/native';

import TripListScreen from '../screens/TripListScreen';
import AddTripScreen from '../screens/AddTripScreen';
import TripOverviewScreen from '../screens/TripOverviewScreen';
import ExpenseListScreen from '../screens/ExpenseListScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ParticipantListScreen from '../screens/ParticipantListScreen';
import SettlementScreen from '../screens/SettlementScreen';
import { Text } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Types for params
type RootStackParamList = {
  TripList: undefined;
  AddTrip: undefined;
  TripHome: { tripId: number; title: string };
  AddExpense: { tripId: number };
};

function TripTabNavigator() {
  const route = useRoute<RouteProp<RootStackParamList, 'TripHome'>>();
  const { tripId, title } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1565c0',
      }}
    >
      <Tab.Screen
        name="Overview"
        component={TripOverviewScreen}
        initialParams={{ tripId }}
        options={{ tabBarIcon: ({color}) => <Text style={{color}}>📊</Text> }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpenseListScreen}
        initialParams={{ tripId }}
        options={{ tabBarIcon: ({color}) => <Text style={{color}}>💸</Text> }}
      />
      <Tab.Screen
        name="Participants"
        component={ParticipantListScreen}
        initialParams={{ tripId }}
        options={{ tabBarIcon: ({color}) => <Text style={{color}}>👥</Text> }}
      />
      <Tab.Screen
        name="Settlement"
        component={SettlementScreen}
        initialParams={{ tripId }}
        options={{ tabBarIcon: ({color}) => <Text style={{color}}>🤝</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TripList" component={TripListScreen} options={{ title: 'My Trips' }} />
      <Stack.Screen name="AddTrip" component={AddTripScreen} options={{ title: 'New Trip' }} />
      <Stack.Screen
        name="TripHome"
        component={TripTabNavigator}
        options={({ route }: any) => ({ title: route.params.title })}
      />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Add Expense' }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
