/**
 * MascotScreen
 * 
 * Example screen showing mascot display with progress tracking
 * and evolution animations
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useMascot } from '../hooks/useMascot';
import { MascotDisplay } from '../components/MascotDisplay';
import { MascotEvolutionModal } from '../components/MascotEvolutionModal';
import { MASCOT_STAGE_NAMES } from '../types/mascot';
import { useAuthStore } from '../store';

export const MascotScreen: React.FC = () => {
  const { user } = useAuthStore();
  const {
    status,
    loading,
    error,
    refresh,
    evolutionHistory,
    showEvolutionModal,
    lastEvolution,
    dismissEvolutionModal,
  } = useMascot(user?.id || null);

  // Loading state
  if (loading && !status) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading your Growthovo...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No data state
  if (!status) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No mascot data found</Text>
      </View>
    );
  }

  // Calculate progress percentages
  const levelProgress = Math.min(
    100,
    ((status.totalXP % 50) / 50) * 100
  );
  const stageProgress = status.xpForNextStage > 0
    ? ((status.totalXP / (status.totalXP + status.xpForNextStage)) * 100)
    : 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Growthovo</Text>
        <Text style={styles.subtitle}>
          {MASCOT_STAGE_NAMES[status.stageId]}
        </Text>
      </View>

      {/* Mascot Display */}
      <View style={styles.mascotContainer}>
        <MascotDisplay
          stage={status.stageId}
          size={280}
          animated={false}
          showGlow={false}
        />
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Level</Text>
          <Text style={styles.statValue}>{status.currentLevel}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total XP</Text>
          <Text style={styles.statValue}>{status.totalXP}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Stage</Text>
          <Text style={styles.statValue}>
            {MASCOT_STAGE_NAMES[status.stageId]}
          </Text>
        </View>
      </View>

      {/* Level Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Level Progress</Text>
          <Text style={styles.progressValue}>
            {status.xpForNextLevel} XP to Level {status.currentLevel + 1}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBarFill, { width: `${levelProgress}%` }]}
          />
        </View>
      </View>

      {/* Stage Progress (if not at max stage) */}
      {status.stageId < 4 && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Next Evolution</Text>
            <Text style={styles.progressValue}>
              {status.xpForNextStage} XP to next stage
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                styles.stageProgressFill,
                { width: `${stageProgress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressSubtext}>
            Reach Level {status.nextStageLevel} to evolve!
          </Text>
        </View>
      )}

      {/* Evolution History */}
      {evolutionHistory.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Evolution History</Text>
          {evolutionHistory.map((evolution) => (
            <View key={evolution.id} style={styles.historyItem}>
              <Text style={styles.historyText}>
                {MASCOT_STAGE_NAMES[evolution.fromStage]} →{' '}
                {MASCOT_STAGE_NAMES[evolution.toStage]}
              </Text>
              <Text style={styles.historyDate}>
                Level {evolution.levelAtEvolution} •{' '}
                {new Date(evolution.evolvedAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Evolution Modal */}
      {showEvolutionModal && lastEvolution && (
        <MascotEvolutionModal
          visible={showEvolutionModal}
          fromStage={lastEvolution.fromStage}
          toStage={lastEvolution.toStage}
          newLevel={lastEvolution.levelAtEvolution}
          onClose={dismissEvolutionModal}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '700',
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  progressValue: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  stageProgressFill: {
    backgroundColor: '#FFD700',
  },
  progressSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  historySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#999',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
});

export default MascotScreen;
