import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryPickerProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
    categories,
    selectedCategory,
    onSelectCategory,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.chip,
                            isDark ? styles.chipDark : styles.chipLight,
                            selectedCategory === category && styles.chipSelected,
                        ]}
                        onPress={() => onSelectCategory(category)}
                    >
                        <Text
                            style={[
                                styles.text,
                                isDark ? styles.textDark : styles.textLight,
                                selectedCategory === category && styles.textSelected,
                            ]}
                        >
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        marginBottom: 10,
    },
    scrollContent: {
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
    },
    chipLight: {
        backgroundColor: '#f0f0f0',
        borderColor: '#e0e0e0',
    },
    chipDark: {
        backgroundColor: '#333',
        borderColor: '#444',
    },
    chipSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
    },
    textLight: {
        color: '#333',
    },
    textDark: {
        color: '#fff',
    },
    textSelected: {
        color: '#fff',
    },
});
