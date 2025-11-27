import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TransactionType } from '../context/TransactionContext';
import { CategoryPicker } from './CategoryPicker';

interface TransactionFormProps {
    type: TransactionType;
    categories: string[];
    onSubmit: (data: { amount: number; category: string; date: string; note: string }) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
    type,
    categories,
    onSubmit,
}) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [note, setNote] = useState('');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleSubmit = () => {
        if (!amount || isNaN(Number(amount))) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }
        if (!category) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        onSubmit({
            amount: parseFloat(amount),
            category,
            date: new Date().toISOString(),
            note,
        });

        // Reset form
        setAmount('');
        setNote('');
    };

    return (
        <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>
                Amount
            </Text>
            <TextInput
                style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={isDark ? '#888' : '#aaa'}
            />

            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>
                Category
            </Text>
            <CategoryPicker
                categories={categories}
                selectedCategory={category}
                onSelectCategory={setCategory}
            />

            <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>
                Note (Optional)
            </Text>
            <TextInput
                style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                value={note}
                onChangeText={setNote}
                placeholder="Description"
                placeholderTextColor={isDark ? '#888' : '#aaa'}
            />

            <TouchableOpacity
                style={[styles.button, { backgroundColor: type === 'expense' ? '#FF3B30' : '#34C759' }]}
                onPress={handleSubmit}
            >
                <Text style={styles.buttonText}>
                    Add {type === 'expense' ? 'Expense' : 'Income'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    containerLight: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    containerDark: {
        backgroundColor: '#1c1c1e',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    inputLight: {
        borderColor: '#ddd',
        color: '#000',
        backgroundColor: '#f9f9f9',
    },
    inputDark: {
        borderColor: '#333',
        color: '#fff',
        backgroundColor: '#2c2c2e',
    },
    textLight: {
        color: '#000',
    },
    textDark: {
        color: '#fff',
    },
    button: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
