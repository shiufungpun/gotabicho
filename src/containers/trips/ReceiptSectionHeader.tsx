import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {GlassView} from 'expo-glass-effect';

interface ReceiptSectionHeaderProps {
    /** ISO date string (YYYY-MM-DD) used as the section title */
    title: string;
}

/**
 * Section header for the receipt list.
 * Displays the date in a frosted-glass pill above each group of receipts.
 */
const ReceiptSectionHeader: React.FC<ReceiptSectionHeaderProps> = ({title}) => {
    const dateObj = new Date(title);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', {month: 'short'});
    const year = dateObj.getFullYear();
    const todayYear = new Date().getFullYear();

    const displayDate = year === todayYear ? `${month} ${day}` : `${month} ${day}, ${year}`;

    return (
        <View className="py-2 pl-5 z-10">
            <View className="w-[40px] items-center mr-2"/>
            <GlassView style={styles.dateGlass} isInteractive>
                <Text className="text-blue-800 font-bold text-xs">{displayDate}</Text>
            </GlassView>
        </View>
    );
};

export default ReceiptSectionHeader;

const styles = StyleSheet.create({
    dateGlass: {
        width: 50,
        height: 25,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

