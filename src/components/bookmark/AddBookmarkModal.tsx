import React, {useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ThemedText} from '../index';
import {useTheme} from '../../theme';
import {createBookmark} from '../../repositories/bookmarkRepository';
import {detectBookmarkSource} from '../../types';
import {notifyBookmarkChange} from '../../services/dataEventEmitter';

interface AddBookmarkModalProps {
    visible: boolean;
    onClose: () => void;
    onCreated: (bookmarkId: number, content: string) => void;
}

export function AddBookmarkModal({visible, onClose, onCreated}: AddBookmarkModalProps) {
    const {colors} = useTheme();
    const [url, setUrl] = useState('');
    const [saving, setSaving] = useState(false);

    const handleConfirm = async () => {
        const trimmed = url.trim();
        if (!trimmed) {
            Alert.alert('URL required', 'Please enter a URL to save.');
            return;
        }

        setSaving(true);
        try {
            const source = detectBookmarkSource(trimmed);
            const bookmarkId = await createBookmark({
                title: trimmed,
                description: null,
                url: trimmed,
                thumbnail_url: null,
                source: source,
                visited: false,
            });

            notifyBookmarkChange();
            setUrl('');
            onCreated(bookmarkId, trimmed);
        } catch (e) {
            console.error('[AddBookmarkModal] Error creating bookmark:', e);
            Alert.alert('Error', 'Failed to save bookmark. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setUrl('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{flex: 1}}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleClose}
                    style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'}}
                >
                    <TouchableOpacity activeOpacity={1}>
                        <View style={{
                            backgroundColor: colors.surface,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            padding: 24,
                            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
                        }}>
                            {/* Handle */}
                            <View style={{
                                width: 40,
                                height: 4,
                                backgroundColor: colors.border,
                                borderRadius: 2,
                                alignSelf: 'center',
                                marginBottom: 20,
                            }}/>

                            <ThemedText textStyle="title" style={{marginBottom: 6}}>Add Bookmark</ThemedText>
                            <ThemedText variant="secondary" style={{fontSize: 13, marginBottom: 16}}>
                                Paste a URL — AI will extract attractions automatically.
                            </ThemedText>

                            {/* URL input */}
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.card,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.border,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                marginBottom: 20,
                            }}>
                                <Ionicons name="link-outline" size={18} color={colors.textTertiary}
                                          style={{marginRight: 8}}/>
                                <TextInput
                                    value={url}
                                    onChangeText={setUrl}
                                    placeholder="https://..."
                                    placeholderTextColor={colors.textTertiary}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="url"
                                    style={{flex: 1, color: colors.text, fontSize: 14}}
                                    editable={!saving}
                                />
                                {url.length > 0 && (
                                    <TouchableOpacity onPress={() => setUrl('')}>
                                        <Ionicons name="close-circle" size={18} color={colors.textTertiary}/>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Buttons */}
                            <View style={{flexDirection: 'row', gap: 10}}>
                                <TouchableOpacity
                                    onPress={handleClose}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 13,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        alignItems: 'center',
                                    }}
                                >
                                    <ThemedText variant="secondary"
                                                style={{fontWeight: '600', fontSize: 15}}>Cancel</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    disabled={saving || url.trim().length === 0}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 13,
                                        borderRadius: 12,
                                        backgroundColor: url.trim().length === 0 ? colors.border : colors.primary,
                                        alignItems: 'center',
                                    }}
                                >
                                    {saving
                                        ? <ActivityIndicator size="small" color="white"/>
                                        : <ThemedText style={{color: 'white', fontWeight: '600', fontSize: 15}}>Save &
                                            Extract</ThemedText>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
}

