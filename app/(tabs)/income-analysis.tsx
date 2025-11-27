import { useTransactions } from '@/context/TransactionContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IncomeAnalysisScreen() {
    const { transactions } = useTransactions();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const incomeTransactions = useMemo(() => {
        return transactions.filter(t => t.type === 'income');
    }, [transactions]);

    const categoryTotals = useMemo(() => {
        const totals: { [key: string]: number } = {};
        incomeTransactions.forEach(t => {
            totals[t.category] = (totals[t.category] || 0) + t.amount;
        });
        return totals;
    }, [incomeTransactions]);

    const barData = Object.keys(categoryTotals).map((cat) => ({
        value: categoryTotals[cat],
        label: cat.substring(0, 3), // Shorten label
        frontColor: '#34C759',
    }));

    const totalIncome = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    return (
        <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>Income Analysis</Text>
                </View>

                <View style={[styles.summaryCard, isDark ? styles.cardDark : styles.cardLight]}>
                    <Text style={[styles.summaryLabel, isDark ? styles.subTextDark : styles.subTextLight]}>
                        Total Income
                    </Text>
                    <Text style={[styles.summaryAmount, isDark ? styles.textDark : styles.textLight]}>
                        ${totalIncome.toFixed(2)}
                    </Text>
                </View>

                {barData.length > 0 ? (
                    <View style={styles.chartContainer}>
                        <BarChart
                            data={barData}
                            barWidth={30}
                            noOfSections={4}
                            barBorderRadius={4}
                            frontColor="#34C759"
                            yAxisThickness={0}
                            xAxisThickness={0}
                            yAxisTextStyle={{ color: isDark ? '#fff' : '#000' }}
                            xAxisLabelTextStyle={{ color: isDark ? '#fff' : '#000' }}
                        />
                    </View>
                ) : (
                    <Text style={[styles.emptyText, isDark ? styles.textDark : styles.textLight]}>
                        No income recorded yet.
                    </Text>
                )}

                <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
                    Breakdown by Category
                </Text>

                {Object.keys(categoryTotals).map(category => (
                    <View key={category} style={[styles.row, isDark ? styles.cardDark : styles.cardLight]}>
                        <Text style={[styles.categoryName, isDark ? styles.textDark : styles.textLight]}>
                            {category}
                        </Text>
                        <Text style={[styles.amount, isDark ? styles.textDark : styles.textLight]}>
                            ${categoryTotals[category].toFixed(2)}
                        </Text>
                    </View>
                ))}
            </ScrollView>
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
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        padding: 20,
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
    },
    summaryCard: {
        margin: 20,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    cardLight: {
        backgroundColor: '#fff',
    },
    cardDark: {
        backgroundColor: '#1c1c1e',
    },
    summaryLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    summaryAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#34C759',
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 12,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '500',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
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
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
});
