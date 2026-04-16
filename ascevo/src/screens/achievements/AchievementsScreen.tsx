import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import AchievementBadge from '../../components/gamification/AchievementBadge';
import {
  getAchievementGridColumns,
  getAchievementBadgeSize,
} from '../../components/gamification/responsive';
import {
  getAllAchievements,
  getAchievementsByCategory,
  getUserAchievements,
} from '../../services/gamificationService';
import { loadAchievementAssets } from '../../services/assetLoadingService';
import type { AchievementDefinition, Achievement, AchievementCategory } from '../../types';

interface AchievementsScreenProps {
  userId: string;
}

type FilterCategory = 'all' | AchievementCategory;

/**
 * AchievementsScreen - Display all achievements in grid layout
 * 
 * Features:
 * - Display all achievements in grid layout
 * - Show unlocked badges with unlock dates
 * - Show locked badges with requirements
 * - Filter by category (streak, lessons, social, special)
 * - Add badge detail modal
 * - Batch load achievement assets for performance
 * 
 * Requirements: 3.2, 3.3, 3.4, 3.5, 12.4
 */
export default function AchievementsScreen({ userId }: AchievementsScreenProps) {
  const [loading, setLoading] = useState(true);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<{
    definition: AchievementDefinition;
    unlocked: boolean;
    unlockedAt?: string;
  } | null>(null);

  // Load user's unlocked achievements
  useEffect(() => {
    loadAchievements();
  }, [userId]);

  // Batch load all achievement assets when screen mounts
  useEffect(() => {
    // Load all achievement assets in the background
    // This is more efficient than loading them one by one
    loadAchievementAssets()
      .catch((err) => {
        console.warn('[AchievementsScreen] Failed to load achievement assets:', err);
      });
  }, []);

  async function loadAchievements() {
    try {
      setLoading(true);
      const achievements = await getUserAchievements(userId);
      setUnlockedAchievements(achievements);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  }

  // Get all achievement definitions
  const allDefinitions = getAllAchievements();

  // Filter achievements by selected category
  const filteredDefinitions =
    selectedCategory === 'all'
      ? allDefinitions
      : getAchievementsByCategory(selectedCategory);

  // Create a map of unlocked achievement IDs for quick lookup
  const unlockedMap = new Map(
    unlockedAchievements.map((a) => [a.achievementId, a])
  );

  // Calculate stats
  const totalAchievements = allDefinitions.length;
  const unlockedCount = unlockedAchievements.length;
  const progressPercentage = Math.round((unlockedCount / totalAchievements) * 100);

  // Handle badge press - show detail modal
  function handleBadgePress(definition: AchievementDefinition) {
    const unlocked = unlockedMap.has(definition.id);
    const achievement = unlockedMap.get(definition.id);
    
    setSelectedAchievement({
      definition,
      unlocked,
      unlockedAt: achievement?.unlockedAt,
    });
  }

  // Close detail modal
  function closeModal() {
    setSelectedAchievement(null);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <GlassCard intensity="medium" style={styles.statsCard}>
          <Text style={styles.statsText}>
            {unlockedCount} / {totalAchievements} Unlocked
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{progressPercentage}% Complete</Text>
        </GlassCard>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <CategoryFilter
          label="All"
          category="all"
          selected={selectedCategory === 'all'}
          onPress={() => setSelectedCategory('all')}
          count={allDefinitions.length}
        />
        <CategoryFilter
          label="Streak"
          category="streak"
          selected={selectedCategory === 'streak'}
          onPress={() => setSelectedCategory('streak')}
          count={getAchievementsByCategory('streak').length}
        />
        <CategoryFilter
          label="Lessons"
          category="lessons"
          selected={selectedCategory === 'lessons'}
          onPress={() => setSelectedCategory('lessons')}
          count={getAchievementsByCategory('lessons').length}
        />
        <CategoryFilter
          label="Social"
          category="social"
          selected={selectedCategory === 'social'}
          onPress={() => setSelectedCategory('social')}
          count={getAchievementsByCategory('social').length}
        />
        <CategoryFilter
          label="Special"
          category="special"
          selected={selectedCategory === 'special'}
          onPress={() => setSelectedCategory('special')}
          count={getAchievementsByCategory('special').length}
        />
      </ScrollView>

      {/* Achievement Grid */}
      <FlatList
        key={`columns-${getAchievementGridColumns()}`}
        data={filteredDefinitions}
        keyExtractor={(item) => item.id}
        numColumns={getAchievementGridColumns()}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => {
          const unlocked = unlockedMap.has(item.id);
          return (
            <View style={styles.badgeWrapper}>
              <AchievementBadge
                achievement={item}
                unlocked={unlocked}
                size={getAchievementBadgeSize()}
                onPress={() => handleBadgePress(item)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No achievements in this category
            </Text>
          </View>
        }
      />

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <GlassModal
          visible={true}
          onClose={closeModal}
          animationType="scale"
          blurIntensity={20}
        >
          <View style={styles.modalContent}>
            {/* Large Badge */}
            <AchievementBadge
              achievement={selectedAchievement.definition}
              unlocked={selectedAchievement.unlocked}
              size="large"
            />

            {/* Title */}
            <Text style={styles.modalTitle}>
              {selectedAchievement.definition.title}
            </Text>

            {/* Description */}
            <Text style={styles.modalDescription}>
              {selectedAchievement.definition.description}
            </Text>

            {/* Unlock Date (if unlocked) */}
            {selectedAchievement.unlocked && selectedAchievement.unlockedAt && (
              <GlassCard intensity="light" style={styles.unlockDateCard}>
                <Text style={styles.unlockDateLabel}>Unlocked</Text>
                <Text style={styles.unlockDateText}>
                  {formatUnlockDate(selectedAchievement.unlockedAt)}
                </Text>
              </GlassCard>
            )}

            {/* Requirements (if locked) */}
            {!selectedAchievement.unlocked && (
              <GlassCard intensity="light" style={styles.requirementCard}>
                <Text style={styles.requirementLabel}>How to Unlock</Text>
                <Text style={styles.requirementText}>
                  {getRequirementText(selectedAchievement.definition)}
                </Text>
              </GlassCard>
            )}

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </GlassModal>
      )}
    </View>
  );
}

/**
 * Category Filter Button Component
 */
interface CategoryFilterProps {
  label: string;
  category: FilterCategory;
  selected: boolean;
  onPress: () => void;
  count: number;
}

function CategoryFilter({
  label,
  category,
  selected,
  onPress,
  count,
}: CategoryFilterProps) {
  const cardStyle = selected
    ? StyleSheet.flatten([styles.filterCard, styles.filterCardSelected])
    : styles.filterCard;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.filterButton}
    >
      <GlassCard intensity={selected ? 'heavy' : 'light'} style={cardStyle}>
        <Text
          style={[
            styles.filterLabel,
            selected && styles.filterLabelSelected,
          ]}
        >
          {label}
        </Text>
        <Text style={styles.filterCount}>{count}</Text>
      </GlassCard>
    </TouchableOpacity>
  );
}

/**
 * Format unlock date for display
 */
function formatUnlockDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

/**
 * Generate unlock requirement text from criteria
 */
function getRequirementText(achievement: AchievementDefinition): string {
  const { criteria } = achievement;

  switch (criteria.type) {
    case 'streak':
      return `Reach a ${criteria.threshold} day streak`;
    case 'xp_total':
      return `Earn ${criteria.threshold} total XP`;
    case 'lessons_count':
      return `Complete ${criteria.threshold} lessons`;
    case 'level':
      return `Reach level ${criteria.threshold}${criteria.pillarId ? ` in ${criteria.pillarId}` : ' in any pillar'}`;
    case 'custom':
      return achievement.description;
    default:
      return achievement.description;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsCard: {
    padding: 16,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterContainer: {
    maxHeight: 80,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    marginRight: 8,
  },
  filterCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  filterCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  filterLabelSelected: {
    color: colors.primary,
  },
  filterCount: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  gridContent: {
    padding: 20,
    paddingTop: 0,
  },
  badgeWrapper: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  modalContent: {
    alignItems: 'center',
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  unlockDateCard: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  unlockDateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  unlockDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  requirementCard: {
    width: '100%',
    padding: 16,
    marginBottom: 20,
  },
  requirementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },
  closeButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
