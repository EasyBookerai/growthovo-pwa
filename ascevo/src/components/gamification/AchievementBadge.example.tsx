import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import AchievementBadge from './AchievementBadge';
import { AchievementDefinition } from '../../types';
import { colors } from '../../theme';

/**
 * AchievementBadge Component Examples
 * 
 * This file demonstrates various usage patterns for the AchievementBadge component.
 */

// Sample achievement definitions
const SAMPLE_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'streak_7',
    title: '7 Day Warrior',
    description: 'Complete 7 days in a row',
    icon: '🔥',
    category: 'streak',
    criteria: { type: 'streak', threshold: 7 },
  },
  {
    id: 'streak_30',
    title: 'Month Master',
    description: 'Complete 30 days in a row',
    icon: '🌟',
    category: 'streak',
    criteria: { type: 'streak', threshold: 30 },
  },
  {
    id: 'lessons_10',
    title: 'Quick Learner',
    description: 'Complete 10 lessons',
    icon: '📚',
    category: 'lessons',
    criteria: { type: 'lessons_count', threshold: 10 },
  },
  {
    id: 'lessons_50',
    title: 'Knowledge Seeker',
    description: 'Complete 50 lessons',
    icon: '🎓',
    category: 'lessons',
    criteria: { type: 'lessons_count', threshold: 50 },
  },
  {
    id: 'social_squad',
    title: 'Squad Leader',
    description: 'Create or join a squad',
    icon: '👥',
    category: 'social',
    criteria: { type: 'custom', threshold: 1 },
  },
  {
    id: 'social_friends',
    title: 'Social Butterfly',
    description: 'Add 5 friends',
    icon: '🦋',
    category: 'social',
    criteria: { type: 'custom', threshold: 5 },
  },
  {
    id: 'xp_1000',
    title: 'XP Collector',
    description: 'Earn 1000 total XP',
    icon: '💎',
    category: 'special',
    criteria: { type: 'xp_total', threshold: 1000 },
  },
  {
    id: 'level_10',
    title: 'Level Master',
    description: 'Reach level 10',
    icon: '⭐',
    category: 'special',
    criteria: { type: 'level', threshold: 10 },
  },
];

export default function AchievementBadgeExample() {
  const handleBadgePress = (achievement: AchievementDefinition, unlocked: boolean) => {
    console.log(`Pressed ${achievement.title} (${unlocked ? 'unlocked' : 'locked'})`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Small Size Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Small Size</Text>
        <View style={styles.row}>
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[0]}
            unlocked={true}
            size="small"
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[0], true)}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[1]}
            unlocked={false}
            size="small"
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[1], false)}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[2]}
            unlocked={true}
            size="small"
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[2], true)}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[3]}
            unlocked={false}
            size="small"
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[3], false)}
          />
        </View>
      </View>

      {/* Medium Size Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medium Size (Default)</Text>
        <View style={styles.row}>
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[0]}
            unlocked={true}
            size="medium"
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[0], true)}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[1]}
            unlocked={false}
            size="medium"
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[1], false)}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[2]}
            unlocked={true}
            size="medium"
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[2], true)}
          />
        </View>
      </View>

      {/* Large Size Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Large Size</Text>
        <View style={styles.row}>
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[4]}
            unlocked={true}
            size="large"
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[4], true)}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[5]}
            unlocked={false}
            size="large"
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[5], false)}
          />
        </View>
      </View>

      {/* Category Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Categories (Unlocked)</Text>
        <View style={styles.row}>
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[0]}
            unlocked={true}
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[0], true)}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[2]}
            unlocked={true}
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[2], true)}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[4]}
            unlocked={true}
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[4], true)}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[6]}
            unlocked={true}
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[6], true)}
          />
        </View>
      </View>

      {/* Locked Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Locked Badges with Requirements</Text>
        <View style={styles.row}>
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[1]}
            unlocked={false}
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[1], false)}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[3]}
            unlocked={false}
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[3], false)}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[7]}
            unlocked={false}
            onPress={() => handleBadgePress(SAMPLE_ACHIEVEMENTS[7], false)}
          />
        </View>
      </View>

      {/* Grid Layout Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievement Grid</Text>
        <View style={styles.grid}>
          {SAMPLE_ACHIEVEMENTS.map((achievement, index) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              unlocked={index % 2 === 0} // Alternate unlocked/locked
              size="small"
              onPress={() => handleBadgePress(achievement, index % 2 === 0)}
            />
          ))}
        </View>
      </View>

      {/* Non-interactive Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Non-interactive (No onPress)</Text>
        <View style={styles.row}>
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[0]}
            unlocked={true}
          />
          <AchievementBadge
            achievement={SAMPLE_ACHIEVEMENTS[1]}
            unlocked={false}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
