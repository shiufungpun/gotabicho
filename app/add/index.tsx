import {ScrollView} from 'react-native';
import {Stack} from 'expo-router';
import {SearchBar} from "react-native-screens";

export default function SearchIndex() {
    return (
        <Stack>
            <Stack.Screen options={{title: '首頁'}}/>
            <SearchBar placement="automatic" placeholder="Search" onChangeText={() => {
            }}/>
            <ScrollView>{/* Screen content */}</ScrollView>
        </Stack>
    );
}
