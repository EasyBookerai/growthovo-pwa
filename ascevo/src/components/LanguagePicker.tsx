import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import { LANGUAGE_OPTIONS } from '../services/i18nService';
import type { SupportedLanguage } from '../services/i18nService';
import { colors, typography, spacing, radius } from '../theme';

interface LanguagePickerProps {
  selected: SupportedLanguage;
  onSelect: (code: SupportedLanguage) => void;
}

export default function LanguagePicker({ selected, onSelect }: LanguagePickerProps) {
  return (
    <FlatList
      data={LANGUAGE_OPTIONS}
      keyExtractor={(item) => item.code}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
      renderItem={({ item }) => {
        const isSelected = item.code === selected;
        return (
          <TouchableOpacity
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => onSelect(item.code)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={item.nativeName}
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>{item.flag}</Text>
            <Text style={[styles.name, isSelected && styles.nameSelected]}>
              {item.nativeName}
            </Text>
            {isSelected && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    minHeight: 90,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '22',
  },
  flag: {
    fontSize: 36,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textMuted,
    textAlign: 'center',
  },
  nameSelected: {
    color: colors.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
