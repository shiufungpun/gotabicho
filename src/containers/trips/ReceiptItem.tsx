import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import {ReceiptWithDetails} from '../../types';

interface ReceiptItemProps {
    receipt: ReceiptWithDetails;
    /** The current user's participant ID, used to calculate the personal share */
    myId?: number;
}

/**
 * A single row in the receipt list.
 * Shows store name, category, total amount, and the user's personal split (if applicable).
 */
const ReceiptItem: React.FC<ReceiptItemProps> = ({receipt, myId}) => {
    const router = useRouter();

    // Calculate how much the current user owes for this receipt
    let myShare = 0;
    if (myId) {
        receipt.items.forEach(rItem => {
            const share = rItem.shares.find(s => s.participant_id === myId);
            if (share) {
                myShare += share.share_amount;
            }
        });
    }

    const isSplit = myShare > 0 && Math.abs(myShare - receipt.total_amount) > 0.01;
    const displayAmount = isSplit
        ? `${receipt.currency} ${myShare.toLocaleString()} (${receipt.total_amount.toLocaleString()})`
        : `${receipt.currency} ${receipt.total_amount.toLocaleString()}`;

    return (
        <View className="mx-5 mb-0">
            <TouchableOpacity
                onPress={() => router.push(`/receipt/${receipt.id}`)}
                className="flex-1 bg-white p-4 mb-3 rounded-xl shadow-sm flex-row justify-between items-center"
            >
                <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-base">
                        {receipt.store_name || 'Expense'}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        {receipt.items.length > 0 ? (
                            <Text className="text-gray-500 text-xs mr-2 px-1.5 py-0.5 bg-gray-100 rounded">
                                {receipt.items[0].category}
                            </Text>
                        ) : (
                            <Text className="text-gray-500 text-xs mr-2 px-1.5 py-0.5 bg-gray-100 rounded">
                                General
                            </Text>
                        )}
                    </View>
                </View>

                <View>
                    <Text className="text-gray-900 font-bold text-right">{displayAmount}</Text>
                    {isSplit && (
                        <Text className="text-gray-400 text-[10px] text-right">Split</Text>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default ReceiptItem;

