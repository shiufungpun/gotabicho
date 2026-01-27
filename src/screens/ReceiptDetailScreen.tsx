import React, {useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {getReceiptById} from '../repositories/receiptRepository';
import {getParticipantsByTripId} from '../repositories/participantRepository';
import {Participant, ReceiptWithDetails} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ReceiptDetail'>;

export default function ReceiptDetailScreen({route}: Props) {
    const {receiptId} = route.params;
    const [receipt, setReceipt] = useState<ReceiptWithDetails | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);

    useEffect(() => {
        loadData();
    }, [receiptId]);

    const loadData = async () => {
        try {
            const r = await getReceiptById(receiptId);
            setReceipt(r);
            if (r) {
                const parts = await getParticipantsByTripId(r.trip_id);
                setParticipants(parts);
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!receipt) return <View className="flex-1 bg-white items-center justify-center"><Text>Loading...</Text></View>;

    return (
        <ScrollView className="flex-1 bg-gray-50 p-4">
            <View className="bg-white p-6 rounded-xl shadow-sm mb-4">
                <Text className="text-3xl font-bold text-gray-900 mb-2">{receipt.store_name}</Text>
                <Text className="text-gray-500 mb-4">{new Date(receipt.date).toDateString()}</Text>

                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">Total Amount</Text>
                    <Text className="text-xl font-bold bg-blue-100 px-2 rounded text-blue-800">
                        {receipt.currency} {receipt.total_amount.toLocaleString()}
                    </Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-gray-600">Paid By</Text>
                    <Text className="font-bold text-gray-800">{receipt.payer_name}</Text>
                </View>
            </View>

            <Text className="text-lg font-bold text-gray-700 mb-2 ml-1">Items</Text>
            {receipt.items.map((item, idx) => (
                <View key={idx} className="bg-white p-4 rounded-xl mb-3 shadow-sm">
                    <View className="flex-row justify-between mb-2 pb-2 border-b border-gray-100">
                        <View>
                            <Text className="font-bold text-lg">{item.name}</Text>
                            <Text className="text-gray-400 text-xs">{item.category}</Text>
                        </View>
                        <Text className="font-bold text-lg">{receipt.currency} {item.amount.toLocaleString()}</Text>
                    </View>

                    <View>
                        {item.shares.map((share, sIdx) => {
                            const pName = participants.find(p => p.id === share.participant_id)?.name || 'Unknown';
                            return (
                                <View key={sIdx} className="flex-row justify-between mt-1">
                                    <Text className="text-gray-500 text-sm">{pName}</Text>
                                    <Text
                                        className="text-gray-700 text-sm font-medium">{share.share_amount.toLocaleString()}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

