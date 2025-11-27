import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Transaction, useTransactions } from '../context/TransactionContext';
import { IconSymbol } from './ui/icon-symbol';

interface TransactionListProps {
    transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    const { deleteTransaction } = useTransactions();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={[styles.item, isDark ? styles.itemDark : styles.itemLight]}>
            <View style={styles.leftContent}>
                <Text style={[styles.category, isDark ? styles.textDark : styles.textLight]}>
                    {item.category}
                </Text>
                <Text style={[styles.date, isDark ? styles.subTextDark : styles.subTextLight]}>
                    {new Date(item.date).toLocaleDateString()}
                    {item.note ? ` - ${item.note}` : ''}
                </Text>
            </View>
            <View style={styles.rightContent}>
                <Text
                    style={[
                        styles.amount,
                        item.type === 'expense' ? styles.expenseText : styles.incomeText
                    ]}
                >
                    {item.type === 'expense' ? '-' : '+'}${item.amount.toFixed(2)}
                </Text>
                <TouchableOpacity
                    onPress={() => deleteTransaction(item.id)}
                    style={styles.deleteButton}
                >
                    <IconSymbol name="trash.fill" size={20} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
                <Text style={[styles.emptyText, isDark ? styles.subTextDark : styles.subTextLight]}>
                    No transactions yet
                </Text>
            }
        />
    );
};

const styles = StyleSheet.create({
    list: {
        paddingBottom: 20,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    itemLight: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    itemDark: {
        backgroundColor: '#1c1c1e',
    },
    leftContent: {
        flex: 1,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    category: {
        fontSize: 16,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        marginTop: 4,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 12,
    },
    expenseText: {
        color: '#FF3B30',
    },
    incomeText: {
        color: '#34C759',
    },
    textLight: {
        color: '#000',
    },
    textDark: {
        color: '#fff',
    },
    subTextLight: {
        color: '#666',
    },
    subTextDark: {
        color: '#aaa',
    },
    deleteButton: {
        padding: 4,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
    },
});
