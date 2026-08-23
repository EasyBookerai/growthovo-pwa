import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { authColors, authSpacing, authTypography } from '../../theme/authTokens';

export default function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <View style={styles.row} accessibilityElementsHidden>
      <View style={styles.line} />
      <Text style={styles.text}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: authSpacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: authColors.divider,
  },
  text: {
    ...authTypography.small,
    color: authColors.textSubtle,
    marginHorizontal: authSpacing.md,
    textTransform: 'lowercase',
  },
});
