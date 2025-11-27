import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string; // ISO string
  note?: string;
  type: TransactionType;
}

export interface Budget {
  [category: string]: number; // monthly limit
}

export const EXPENSE_CATEGORIES = [
  'Alquiler', 'Luz', 'Agua', 'Internet', 'Subscripciones', 'Comida', 
  'Salud', 'Otros', 'Casa', 'Deporte', 'Transporte', 'Delivery', 
  'Ocio', 'Regalos', '3D'
];

export const INCOME_CATEGORIES = [
  'Sueldo', 'Devuelta', 'Hustle', 'Otros'
];

interface TransactionContextType {
  transactions: Transaction[];
  budgets: Budget;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  setCategoryBudget: (category: string, amount: number) => void;
  loading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [transactions, budgets]);

  const loadData = async () => {
    try {
      const storedTransactions = await AsyncStorage.getItem('transactions');
      const storedBudgets = await AsyncStorage.getItem('budgets');
      
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedBudgets) setBudgets(JSON.parse(storedBudgets));
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const setCategoryBudget = (category: string, amount: number) => {
    setBudgets(prev => ({ ...prev, [category]: amount }));
  };

  return (
    <TransactionContext.Provider 
      value={{ 
        transactions, 
        budgets, 
        addTransaction, 
        deleteTransaction, 
        setCategoryBudget,
        loading 
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
