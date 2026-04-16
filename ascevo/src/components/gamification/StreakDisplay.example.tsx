/**
 * StreakDisplay Component - Usage Examples
 * 
 * This file demonstrates how to use the StreakDisplay component
 * in different scenarios within the app.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import StreakDisplay from './StreakDisplay';

/**
 * Example 1: Compact variant on HomeScreen
 * Shows current streak with freeze count
 */
export function HomeScreenStreakExample() {
  return (
    <View style={styles.container}>
      <StreakDisplay
        streak={15}
        isAtRisk={false}
        freezeCount={2}
        variant="compact"
        onPress={() => console.log('Navigate to streak details')}
      />
    </View>
  );
}

/**
 * Example 2: At-risk streak warning
 * Shows skull emoji and warning label
 */
export function AtRiskStreakExample() {
  return (
    <View style={styles.container}>
      <StreakDisplay
        streak={7}
        isAtRisk={true}
        freezeCount={1}
        variant="compact"
        onPress={() => console.log('Show streak recovery options')}
      />
    </View>
  );
}

/**
 * Example 3: Expanded variant for streak details screen
 * Shows full streak information with milestone celebration
 */
export function StreakDetailsExample() {
  return (
    <View style={styles.container}>
      <StreakDisplay
        streak={30}
        isAtRisk={false}
        freezeCount={3}
        variant="expanded"
        onPress={() => console.log('Show streak history')}
      />
    </View>
  );
}

/**
 * Example 4: Milestone celebration (7 days)
 * Shows special milestone banner
 */
export function MilestoneStreakExample() {
  return (
    <View style={styles.container}>
      <StreakDisplay
        streak={7}
        isAtRisk={false}
        freezeCount={2}
        variant="expanded"
      />
    </View>
  );
}

/**
 * Example 5: Zero streak (new user or after break)
 * Shows starting state
 */
export function ZeroStreakExample() {
  return (
    <View style={styles.container}>
      <StreakDisplay
        streak={0}
        isAtRisk={false}
        freezeCount={0}
        variant="compact"
        onPress={() => console.log('Show streak tutorial')}
      />
    </View>
  );
}

/**
 * Example 6: High streak with no freezes
 * Shows advanced user state
 */
export function HighStreakExample() {
  return (
    <View style={styles.container}>
      <StreakDisplay
        streak={100}
        isAtRisk={false}
        freezeCount={0}
        variant="expanded"
      />
    </View>
  );
}

/**
 * Complete showcase of all variants
 */
export function StreakDisplayShowcase() {
  return (
    <ScrollView style={styles.showcase}>
      <Text style={styles.sectionTitle}>Compact Variants</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Normal Streak</Text>
        <StreakDisplay
          streak={15}
          isAtRisk={false}
          freezeCount={2}
          variant="compact"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>At Risk Streak</Text>
        <StreakDisplay
          streak={7}
          isAtRisk={true}
          freezeCount={1}
          variant="compact"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>No Freezes</Text>
        <StreakDisplay
          streak={20}
          isAtRisk={false}
          freezeCount={0}
          variant="compact"
        />
      </View>

      <Text style={styles.sectionTitle}>Expanded Variants</Text>

      <View style={styles.section}>
        <Text style={styles.label}>7 Day Milestone</Text>
        <StreakDisplay
          streak={7}
          isAtRisk={false}
          freezeCount={2}
          variant="expanded"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>30 Day Milestone</Text>
        <StreakDisplay
          streak={30}
          isAtRisk={false}
          freezeCount={3}
          variant="expanded"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>100 Day Milestone</Text>
        <StreakDisplay
          streak={100}
          isAtRisk={false}
          freezeCount={5}
          variant="expanded"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>At Risk (Expanded)</Text>
        <StreakDisplay
          streak={15}
          isAtRisk={true}
          freezeCount={0}
          variant="expanded"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  showcase: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
});
