import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {getParticipantsByTripId} from '../repositories/participantRepository';
import {createReceipt} from '../repositories/receiptRepository';
import {Participant} from '../types';
import {Ionicons} from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'AddReceipt'>;

type ItemDraft = {
    name: string;
    category: string;
    amount: string;
    shares: { participant_id: number; isSelected: boolean }[];
};

export default function AddReceiptScreen({route, navigation}: Props) {
    const {tripId} = route.params;
    const [participants, setParticipants] = useState<Participant[]>([]);

    // Receipt Level State
    const [storeName, setStoreName] = useState('');
    const [selectedPayerId, setSelectedPayerId] = useState<number | null>(null);
    const [date, setDate] = useState(new Date());

    // Items State
    const [items, setItems] = useState<ItemDraft[]>([]);

    useEffect(() => {
        loadParticipants();
    }, []);

    const loadParticipants = async () => {
        try {
            const data = await getParticipantsByTripId(tripId);
            setParticipants(data);
            // Default payer = "You"
            const you = data.find(p => p.name === 'You');
            if (you) setSelectedPayerId(you.id);
            else if (data.length > 0) setSelectedPayerId(data[0].id);
        } catch (e) {
            console.error(e);
        }
    };

    const addItem = () => {
        // Default all participants selected for split
        const defaultShares = participants.map(p => ({
            participant_id: p.id,
            isSelected: true
        }));

        setItems([...items, {
            name: '',
            category: 'Food',
            amount: '',
            shares: defaultShares
        }]);
    };

    const updateItem = (index: number, field: keyof ItemDraft, value: any) => {
        const newItems = [...items];
        newItems[index] = {...newItems[index], [field]: value};
        setItems(newItems);
    };

    const toggleShare = (itemIndex: number, participantId: number) => {
        const newItems = [...items];
        const item = newItems[itemIndex];
        const shareIndex = item.shares.findIndex(s => s.participant_id === participantId);
        if (shareIndex >= 0) {
            item.shares[shareIndex].isSelected = !item.shares[shareIndex].isSelected;
            setItems(newItems);
        }
    };

    const handleSubmit = async () => {
        if (!storeName || !selectedPayerId || items.length === 0) {
            alert("Please fill in store name and add at least one item.");
            return;
        }

        let totalAmount = 0;
        const processedItems = items.map(item => {
            const amount = parseFloat(item.amount);
            if (isNaN(amount)) throw new Error("Invalid amount");
            totalAmount += amount;

            const selectedShares = item.shares.filter(s => s.isSelected);
            if (selectedShares.length === 0) throw new Error("Every item must have at least one person sharing.");

            const splitAmount = amount / selectedShares.length;

            return {
                name: item.name || 'Item',
                category: item.category,
                amount: amount,
                participantShares: selectedShares.map(s => ({
                    participant_id: s.participant_id,
                    amount: splitAmount // Even split for now
                }))
            };
        });

        const receiptData = {
            trip_id: tripId,
            total_amount: totalAmount,
            currency: 'JPY', // Hardcoded for simplified version
            paid_by_participant_id: selectedPayerId,
            date: date.toISOString(),
            store_name: storeName
        };

        try {
            await createReceipt(receiptData, processedItems);
            navigation.goBack();
        } catch (e) {
            console.error(e);
            alert("Error creating receipt");
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 p-4">

                {/* Receipt Info */}
                <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
                    <Text className="text-gray-500 mb-1">Store / Title</Text>
                    <TextInput
                        className="bg-gray-100 p-2 rounded text-lg mb-4"
                        placeholder="e.g. 7-Eleven"
                        value={storeName}
                        onChangeText={setStoreName}
                    />

                    <Text className="text-gray-500 mb-1">Paid By</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {participants.map(p => (
                            <TouchableOpacity
                                key={p.id}
                                onPress={() => setSelectedPayerId(p.id)}
                                className={`px-4 py-2 rounded-full mr-2 border ${selectedPayerId === p.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-200'}`}
                            >
                                <Text
                                    className={selectedPayerId === p.id ? 'text-blue-700 font-bold' : 'text-gray-600'}>
                                    {p.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Items */}
                <Text className="text-lg font-bold mb-2 ml-1 text-gray-700">Items</Text>
                {items.map((item, idx) => (
                    <View key={idx} className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between mb-2">
                            <TextInput
                                className="flex-1 bg-gray-50 p-2 rounded mr-2"
                                placeholder="Item Name"
                                value={item.name}
                                onChangeText={t => updateItem(idx, 'name', t)}
                            />
                            <TextInput
                                className="w-24 bg-gray-50 p-2 rounded text-right"
                                placeholder="Amount"
                                keyboardType="numeric"
                                value={item.amount}
                                onChangeText={t => updateItem(idx, 'amount', t)}
                            />
                        </View>

                        <View className="flex-row mb-2">
                            {['Food', 'Play', 'Transport', 'Hotel'].map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => updateItem(idx, 'category', cat)}
                                    className={`px-3 py-1 rounded-full mr-2 ${item.category === cat ? 'bg-orange-100' : 'bg-gray-100'}`}
                                >
                                    <Text
                                        className={`text-xs ${item.category === cat ? 'text-orange-700' : 'text-gray-500'}`}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text className="text-xs text-gray-400 mb-2">Split with:</Text>
                        <View className="flex-row flex-wrap">
                            {item.shares.map(s => {
                                const p = participants.find(part => part.id === s.participant_id);
                                return (
                                    <TouchableOpacity
                                        key={s.participant_id}
                                        onPress={() => toggleShare(idx, s.participant_id)}
                                        className={`mr-2 mb-2 px-2 py-1 rounded border ${s.isSelected ? 'bg-green-100 border-green-500' : 'bg-white border-gray-300'}`}
                                    >
                                        <Text
                                            className={`text-xs ${s.isSelected ? 'text-green-800' : 'text-gray-400'}`}>{p?.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}

                <TouchableOpacity onPress={addItem}
                                  className="flex-row justify-center items-center p-4 border-2 border-dashed border-gray-300 rounded-xl mb-8">
                    <Ionicons name="add-circle-outline" size={24} color="#9CA3AF"/>
                    <Text className="text-gray-400 font-bold ml-2">Add Item</Text>
                </TouchableOpacity>

            </ScrollView>

            <TouchableOpacity
                className="bg-blue-600 m-4 p-4 rounded-xl items-center shadow-lg safe-bottom"
                onPress={handleSubmit}
            >
                <Text className="text-white font-bold text-lg">Save Receipt</Text>
            </TouchableOpacity>
        </View>
    );
}

