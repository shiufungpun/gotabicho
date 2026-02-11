import React, {useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, Switch, TextInput, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import {createTrip} from '../src/repositories/tripRepository';
import {useTheme} from '../src/theme';
import {ThemedCard, ThemedText} from "../src/components";
import Slider from "@react-native-community/slider";
import ConfirmGlassButtonBar from "../src/components/ui/ConfirmGlassButtonBar";
import DatePicker from "react-native-date-picker";

export default function AddTripScreen() {
    const [name, setName] = useState('');
    const [hasBudget, setHasBudget] = useState(false);
    const [budgetValue, setBudgetValue] = useState(100000);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const {colors} = useTheme();

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('錯誤', '請輸入旅程名稱');
            return;
        }

        if (endDate < startDate) {
            Alert.alert('錯誤', '結束日期不能早於開始日期');
            return;
        }

        setSaving(true);
        try {
            const result = await createTrip({
                name: name.trim(),
                total_budget: hasBudget ? budgetValue : null,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                base_currency: 'JPY'
            });
            router.navigate("trip/" + result);
        } catch (e) {
            console.log(e);
            Alert.alert('錯誤', '建立旅程失敗');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{backgroundColor: `${colors.background}66`}}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ConfirmGlassButtonBar onConfirm={handleSave} disabled={saving} onCancel={router.back}/>
            <View className={"mx-5"}>
                <ThemedCard>
                    {/* Trip Name */}
                    <ThemedText variant="primary" textStyle="content" className="mb-2">
                        旅程名稱
                    </ThemedText>
                    <TextInput
                        className="border rounded-xl p-4 text-lg"
                        style={{
                            borderColor: colors.border,
                            color: colors.text,
                            backgroundColor: colors.surface,
                            fontFamily: 'HinaMincho_400Regular',
                        }}
                        value={name}
                        onChangeText={setName}
                        placeholder="例：北海道滑雪之旅"
                        placeholderTextColor={colors.textTertiary}
                    />

                    {/* Budget Toggle */}
                    <View className="flex-row justify-between items-center mt-4 mb-2">
                        <ThemedText variant="primary" textStyle="content">
                            設定預算
                        </ThemedText>
                        <Switch
                            value={hasBudget}
                            onValueChange={setHasBudget}
                            trackColor={{false: colors.border, true: colors.primary}}
                        />
                    </View>

                    {/* Budget Slider */}
                    {hasBudget && (
                        <View className="mt-2 mb-2">
                            <ThemedText
                                variant="primary"
                                textStyle="caption"
                                className="text-center text-[28px] font-semibold mb-2"
                            >
                                ¥{budgetValue.toLocaleString('ja-JP')}
                            </ThemedText>
                            <Slider
                                style={{width: '100%', height: 40}}
                                minimumValue={10000}
                                maximumValue={1000000}
                                step={10000}
                                value={budgetValue}
                                onValueChange={setBudgetValue}
                                minimumTrackTintColor={colors.primary}
                                maximumTrackTintColor={colors.border}
                            />
                            <View className="flex-row justify-between px-1">
                                <ThemedText variant="tertiary" textStyle="caption">
                                    ¥10,000
                                </ThemedText>
                                <ThemedText variant="tertiary" textStyle="caption">
                                    ¥1,000,000
                                </ThemedText>
                            </View>
                        </View>
                    )}

                    {/* Start Date */}
                    <ThemedText variant="primary" textStyle="content" className="mb-2 mt-4">
                        開始日期
                    </ThemedText>
                    <TouchableOpacity
                        className="border rounded-xl p-4 items-center"
                        style={{
                            borderColor: colors.border,
                            backgroundColor: colors.surface
                        }}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <ThemedText variant="primary" textStyle="body">
                            {formatDate(startDate)}
                        </ThemedText>
                    </TouchableOpacity>

                    {/* End Date */}
                    <ThemedText variant="primary" textStyle="content" className="mb-2 mt-4">
                        結束日期
                    </ThemedText>
                    <TouchableOpacity
                        className="border rounded-xl p-4 items-center"
                        style={{
                            borderColor: colors.border,
                            backgroundColor: colors.surface
                        }}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <ThemedText variant="primary" textStyle="body">
                            {formatDate(endDate)}
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedCard>
            </View>
            {/*/!*Date Pickers*\/}*/}

            <DatePicker
                modal
                open={showStartPicker}
                date={startDate}
                mode="date"
                onConfirm={(date) => {
                    setShowStartPicker(false);
                    setStartDate(date);
                }}
                onCancel={() => {
                    setShowStartPicker(false);
                }}
                title="選擇開始日期"
                confirmText="確認"
                cancelText="取消"
            />
            <DatePicker
                modal
                open={showEndPicker}
                date={endDate}
                mode="date"
                minimumDate={startDate}
                onConfirm={(date) => {
                    setShowEndPicker(false);
                    setEndDate(date);
                }}
                onCancel={() => {
                    setShowEndPicker(false);
                }}
                title="選擇結束日期"
                confirmText="確認"
                cancelText="取消"
            />
        </KeyboardAvoidingView>
    );
}
