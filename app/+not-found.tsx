import {Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import {useEffect} from 'react';

export default function NotFound() {
    const router = useRouter();

    // Automatically redirect to home after a brief moment
    useEffect(() => {
        console.log('[NotFound] Redirecting to home...');
        const timeout = setTimeout(() => {
            router.replace('/');
        }, 100);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>
                Redirecting...
            </Text>
            <TouchableOpacity
                onPress={() => router.replace('/')}
                style={{
                    marginTop: 20,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    backgroundColor: '#007AFF',
                    borderRadius: 8,
                }}
            >
                <Text style={{color: 'white', fontWeight: 'bold'}}>Go Home</Text>
            </TouchableOpacity>
        </View>
    );
}
