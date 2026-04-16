import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import XPBar from './XPBar';
import { colors } from '../../theme';

/**
 * XPBar Component Examples
 * 
 * This file demonstrates various use cases and configurations
 * of the XPBar component for development and testing purposes.
 */
export default function XPBarExample() {
  const [currentXP, setCurrentXP] = useState(150);
  const requiredXP = 250;
  const level = 3;

  const addXP = (amount: number) => {
    setCurrentXP((prev) => Math.min(prev + amount, requiredXP + 100));
  };

  const resetXP = () => {
    setCurrentXP(0);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>XPBar Component Examples</Text>

      {/* Interactive Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interactive Example</Text>
        <XPBar
          currentXP={currentXP}
          requiredXP={requiredXP}
          level={level}
          animated={true}
        />
        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={() => addXP(10)}>
            <Text style={styles.buttonText}>+10 XP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => addXP(50)}>
            <Text style={styles.buttonText}>+50 XP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={resetXP}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Basic Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Example</Text>
        <XPBar currentXP={75} requiredXP={100} level={2} />
      </View>

      {/* Without Label */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Without Label</Text>
        <XPBar
          currentXP={120}
          requiredXP={250}
          level={3}
          showLabel={false}
        />
      </View>

      {/* Level-Up State */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Level-Up State (100%)</Text>
        <XPBar currentXP={250} requiredXP={250} level={4} />
      </View>

      {/* Overflow State */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overflow State (Over 100%)</Text>
        <XPBar currentXP={300} requiredXP={250} level={4} />
      </View>

      {/* Custom Gradient - Green */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Gradient (Green)</Text>
        <XPBar
          currentXP={180}
          requiredXP={250}
          level={5}
          gradient={['#22C55E', '#16A34A']}
        />
      </View>

      {/* Custom Gradient - Purple */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Gradient (Purple)</Text>
        <XPBar
          currentXP={200}
          requiredXP={250}
          level={6}
          gradient={[colors.primary, '#6D28D9']}
        />
      </View>

      {/* Low Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Low Progress (10%)</Text>
        <XPBar currentXP={10} requiredXP={100} level={1} />
      </View>

      {/* High Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>High Progress (95%)</Text>
        <XPBar currentXP={475} requiredXP={500} level={7} />
      </View>

      {/* Zero Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zero Progress</Text>
        <XPBar currentXP={0} requiredXP={100} level={1} />
      </View>

      {/* High Level */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>High Level (Level 10)</Text>
        <XPBar currentXP={4500} requiredXP={6500} level={10} />
      </View>

      {/* Without Animation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Without Animation</Text>
        <XPBar
          currentXP={150}
          requiredXP={250}
          level={3}
          animated={false}
        />
      </View>

      {/* With onPress Handler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>With onPress Handler</Text>
        <XPBar
          currentXP={180}
          requiredXP={250}
          level={4}
          onPress={() => alert('XP Bar pressed!')}
        />
        <Text style={styles.hint}>Tap the XP bar above</Text>
      </View>

      {/* Different Pillar Levels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Multiple Pillars</Text>
        <View style={styles.pillarContainer}>
          <Text style={styles.pillarLabel}>Mind</Text>
          <XPBar
            currentXP={450}
            requiredXP={500}
            level={5}
            gradient={[colors.pillars.mind, '#6D28D9']}
          />
        </View>
        <View style={styles.pillarContainer}>
          <Text style={styles.pillarLabel}>Discipline</Text>
          <XPBar
            currentXP={200}
            requiredXP={500}
            level={4}
            gradient={[colors.pillars.discipline, '#B91C1C']}
          />
        </View>
        <View style={styles.pillarContainer}>
          <Text style={styles.pillarLabel}>Communication</Text>
          <XPBar
            currentXP={350}
            requiredXP={500}
            level={5}
            gradient={[colors.pillars.communication, '#1E40AF']}
          />
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  pillarContainer: {
    marginBottom: 16,
  },
  pillarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  spacer: {
    height: 40,
  },
});
