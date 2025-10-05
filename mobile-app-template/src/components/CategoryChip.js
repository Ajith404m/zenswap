import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export default function CategoryChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: '#fff',
  },
});
