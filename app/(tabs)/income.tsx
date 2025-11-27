import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { INCOME_CATEGORIES, useTransactions } from '@/context/TransactionContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IncomeScreen() {
    const { addTransaction, transactions } = useTransactions();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const income = transactions
        .filter(t => t.type === 'income')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
            <View style={styles.header}>
                <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>Income</Text>
            </View>

            <View style={styles.content}>
                <TransactionForm
                    type="income"
                    categories={INCOME_CATEGORIES}
                    onSubmit={(data) => addTransaction({ ...data, type: 'income' })}
                />

                <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
                    Recent Income
                </Text>
                <TransactionList transactions={income} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLight: {
        backgroundColor: '#f2f2f7',
    },
    containerDark: {
        backgroundColor: '#000',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 10,
    },
    textLight: {
        color: '#000',
    },
    textDark: {
        color: '#fff',
    },
});
