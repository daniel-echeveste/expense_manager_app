import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { EXPENSE_CATEGORIES, useTransactions } from '@/context/TransactionContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BreakdownScreen() {
    const { transactions, budgets, setCategoryBudget } = useTransactions();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');
    const [editingBudget, setEditingBudget] = useState<string | null>(null);
    const [budgetInput, setBudgetInput] = useState('');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            if (viewMode === 'monthly') {
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            } else {
                return date.getFullYear() === currentYear;
            }
        });
    }, [transactions, viewMode, currentMonth, currentYear]);

    const { expenseTotal, incomeTotal, categoryTotals } = useMemo(() => {
        let expense = 0;
        let income = 0;
        const totals: { [key: string]: number } = {};

        filteredTransactions.forEach(t => {
            if (t.type === 'expense') {
                expense += t.amount;
                totals[t.category] = (totals[t.category] || 0) + t.amount;
            } else {
                income += t.amount;
            }
        });
        return { expenseTotal: expense, incomeTotal: income, categoryTotals: totals };
    }, [filteredTransactions]);

    const pieData = Object.keys(categoryTotals).map((cat, index) => ({
        value: categoryTotals[cat],
        text: `${((categoryTotals[cat] / expenseTotal) * 100).toFixed(0)}%`,
        color: `hsl(${(index * 360) / Object.keys(categoryTotals).length}, 70%, 50%)`,
        legend: cat,
    }));

    const handleSaveBudget = (category: string) => {
        const amount = parseFloat(budgetInput);
        if (isNaN(amount)) {
            Alert.alert('Error', 'Invalid amount');
            return;
        }
        setCategoryBudget(category, amount);
        setEditingBudget(null);
        setBudgetInput('');
    };

    const exportToCsv = async () => {
        try {
            const csvHeader = 'Date,Type,Category,Amount,Note\n';
            const csvRows = transactions.map(t =>
                `${new Date(t.date).toLocaleDateString()},${t.type},${t.category},${t.amount},"${t.note || ''}"`
            ).join('\n');

            const csvContent = csvHeader + csvRows;
            const fileUri = FileSystem.documentDirectory + 'transactions.csv';

            await FileSystem.writeAsStringAsync(fileUri, csvContent);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Error', 'Sharing is not available on this device');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to export CSV');
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>Breakdown</Text>
                    <TouchableOpacity onPress={exportToCsv} style={styles.exportBtn}>
                        <IconSymbol name="square.and.arrow.up" size={24} color={Colors[colorScheme ?? 'light'].tint} />
                    </TouchableOpacity>
                </View>

                <View style={styles.toggleContainerWrapper}>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, viewMode === 'monthly' && styles.toggleBtnActive]}
                            onPress={() => setViewMode('monthly')}
                        >
                            <Text style={[styles.toggleText, viewMode === 'monthly' && styles.toggleTextActive]}>Monthly</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, viewMode === 'annual' && styles.toggleBtnActive]}
                            onPress={() => setViewMode('annual')}
                        >
                            <Text style={[styles.toggleText, viewMode === 'annual' && styles.toggleTextActive]}>Annual</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.summaryCard, isDark ? styles.cardDark : styles.cardLight]}>
                    <View style={styles.summaryRow}>
                        <View>
                            <Text style={[styles.summaryLabel, isDark ? styles.subTextDark : styles.subTextLight]}>Income</Text>
                            <Text style={[styles.incomeText, styles.summaryValue]}>+${incomeTotal.toFixed(2)}</Text>
                        </View>
                        <View>
                            <Text style={[styles.summaryLabel, isDark ? styles.subTextDark : styles.subTextLight]}>Expenses</Text>
                            <Text style={[styles.expenseText, styles.summaryValue]}>-${expenseTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />
                    <View style={styles.netRow}>
                        <Text style={[styles.netLabel, isDark ? styles.textDark : styles.textLight]}>Net Balance</Text>
                        <Text style={[styles.netValue, { color: incomeTotal - expenseTotal >= 0 ? '#34C759' : '#FF3B30' }]}>
                            ${(incomeTotal - expenseTotal).toFixed(2)}
                        </Text>
                    </View>
                </View>

                {pieData.length > 0 ? (
                    <View style={styles.chartContainer}>
                        <PieChart
                            data={pieData}
                            donut
                            showText
                            textColor="white"
                            radius={120}
                            innerRadius={60}
                            textSize={12}
                            showTextBackground
                            textBackgroundRadius={16}
                        />
                        <View style={styles.legendContainer}>
                            {pieData.map((item, index) => (
                                <View key={index} style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                    <Text style={[styles.legendText, isDark ? styles.textDark : styles.textLight]}>
                                        {item.legend} (${item.value.toFixed(2)})
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <Text style={[styles.emptyText, isDark ? styles.textDark : styles.textLight]}>
                        No expenses found for this period.
                    </Text>
                )}

                <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
                    Budgets (Monthly)
                </Text>

                {EXPENSE_CATEGORIES.map(category => {
                    const spent = categoryTotals[category] || 0;
                    const budget = budgets[category] || 0;
                    const isOverBudget = budget > 0 && spent > budget;
                    const progress = budget > 0 ? Math.min(spent / budget, 1) : 0;

                    return (
                        <View key={category} style={[styles.budgetCard, isDark ? styles.cardDark : styles.cardLight]}>
                            <View style={styles.budgetHeader}>
                                <Text style={[styles.categoryName, isDark ? styles.textDark : styles.textLight]}>
                                    {category}
                                </Text>
                                {editingBudget === category ? (
                                    <View style={styles.editContainer}>
                                        <TextInput
                                            style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                                            value={budgetInput}
                                            onChangeText={setBudgetInput}
                                            keyboardType="numeric"
                                            placeholder="Limit"
                                            autoFocus
                                        />
                                        <TouchableOpacity onPress={() => handleSaveBudget(category)}>
                                            <IconSymbol name="checkmark.circle.fill" size={24} color="#34C759" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity onPress={() => {
                                        setEditingBudget(category);
                                        setBudgetInput(budget.toString());
                                    }}>
                                        <Text style={[styles.budgetText, isOverBudget ? styles.overBudget : styles.underBudget]}>
                                            ${spent.toFixed(0)} / ${budget > 0 ? budget : '∞'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {budget > 0 && (
                                <View style={styles.progressBarBg}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${progress * 100}%`,
                                                backgroundColor: isOverBudget ? '#FF3B30' : '#34C759'
                                            }
                                        ]}
                                    />
                                </View>
                            )}
                        </View>
                    );
                })}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
    },
    exportBtn: {
        padding: 8,
    },
    toggleContainerWrapper: {
        alignItems: 'center',
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        padding: 2,
    },
    toggleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    toggleBtnActive: {
        backgroundColor: '#fff',
    },
    toggleText: {
        fontSize: 14,
        color: '#666',
    },
    toggleTextActive: {
        color: '#000',
        fontWeight: '600',
    },
    summaryCard: {
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        marginBottom: 4,
        textAlign: 'center',
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    incomeText: {
        color: '#34C759',
    },
    expenseText: {
        color: '#FF3B30',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    dividerLight: {
        backgroundColor: '#e0e0e0',
    },
    dividerDark: {
        backgroundColor: '#333',
    },
    netRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    netLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    netValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
        paddingHorizontal: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    budgetCard: {
        marginHorizontal: 20,
        marginBottom: 10,
        padding: 16,
        borderRadius: 12,
    },
    cardLight: {
        backgroundColor: '#fff',
    },
    cardDark: {
        backgroundColor: '#1c1c1e',
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
    },
    budgetText: {
        fontSize: 16,
        fontWeight: '500',
    },
    overBudget: {
        color: '#FF3B30',
    },
    underBudget: {
        color: '#34C759',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        width: 80,
        marginRight: 8,
    },
    inputLight: {
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    inputDark: {
        borderColor: '#333',
        backgroundColor: '#2c2c2e',
        color: '#fff',
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
