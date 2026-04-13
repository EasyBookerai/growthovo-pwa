import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Svg, { Line, Circle, Polygon, Rect, Text as SvgText, Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';
import { getSessionHistory, getSpeechProgress } from '../../services/speakingService';
import { SpeechSession, SpeechProgress } from '../../types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProgressDashboardProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      userId: string;
    };
  };
}

// ─── ConfidenceLineChart Component ────────────────────────────────────────────

interface ConfidenceLineChartProps {
  sessions: SpeechSession[];
}

function ConfidenceLineChart({ sessions }: ConfidenceLineChartProps) {
  if (sessions.length === 0) {
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Confidence Over Time</Text>
        <Text style={styles.emptyText}>No sessions yet</Text>
      </View>
    );
  }

  const width = Dimensions.get('window').width - spacing.lg * 2 - spacing.lg * 2;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Get last 10 sessions for the chart
  const recentSessions = sessions.slice(-10);
  const scores = recentSessions.map((s) => s.confidenceScore);
  const maxScore = 100;
  const minScore = 0;

  // Calculate trend (simple linear regression)
  const n = scores.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = scores.reduce((a, b) => a + b, 0);
  const sumXY = scores.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const isTrendingUp = slope > 0;

  // Map scores to chart coordinates
  const points = scores.map((score, index) => {
    const x = padding + (index / (scores.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((score - minScore) / (maxScore - minScore)) * chartHeight;
    return { x, y, score };
  });

  // Create path string
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Confidence Over Time</Text>
      <View style={styles.trendBadge}>
        <Text style={[styles.trendText, { color: isTrendingUp ? colors.success : colors.error }]}>
          {isTrendingUp ? '↑ Trending Up' : '↓ Trending Down'}
        </Text>
      </View>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y = padding + chartHeight - ((value - minScore) / (maxScore - minScore)) * chartHeight;
          return (
            <React.Fragment key={value}>
              <Line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText x={padding - 8} y={y + 4} fontSize={10} fill={colors.textMuted} textAnchor="end">
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Line path */}
        <Path
          d={pathData}
          stroke={isTrendingUp ? colors.success : colors.error}
          strokeWidth={3}
          fill="none"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={isTrendingUp ? colors.success : colors.error} />
        ))}
      </Svg>
    </View>
  );
}

// ─── FillersLineChart Component ───────────────────────────────────────────────

interface FillersLineChartProps {
  sessions: SpeechSession[];
}

function FillersLineChart({ sessions }: FillersLineChartProps) {
  if (sessions.length === 0) {
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Fillers Per Minute</Text>
        <Text style={styles.emptyText}>No sessions yet</Text>
      </View>
    );
  }

  const width = Dimensions.get('window').width - spacing.lg * 2 - spacing.lg * 2;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const recentSessions = sessions.slice(-10);
  const fillers = recentSessions.map((s) => s.fillersPerMinute);
  const maxFiller = Math.max(...fillers, 8);

  const points = fillers.map((fpm, index) => {
    const x = padding + (index / (fillers.length - 1)) * chartWidth;
    const y = padding + chartHeight - (fpm / maxFiller) * chartHeight;
    return { x, y, fpm };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Target zone: < 3/min
  const targetY = padding + chartHeight - (3 / maxFiller) * chartHeight;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Fillers Per Minute</Text>
      <Text style={styles.chartSubtitle}>Target: &lt; 3/min</Text>
      <Svg width={width} height={height}>
        {/* Target zone highlight */}
        <Rect
          x={padding}
          y={targetY}
          width={chartWidth}
          height={chartHeight - (targetY - padding)}
          fill={colors.success}
          opacity={0.1}
        />
        <Line
          x1={padding}
          y1={targetY}
          x2={width - padding}
          y2={targetY}
          stroke={colors.success}
          strokeWidth={2}
          strokeDasharray="4,4"
        />

        {/* Grid lines */}
        {[0, 2, 4, 6, 8].map((value) => {
          const y = padding + chartHeight - (value / maxFiller) * chartHeight;
          return (
            <React.Fragment key={value}>
              <Line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText x={padding - 8} y={y + 4} fontSize={10} fill={colors.textMuted} textAnchor="end">
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Line path */}
        <Path d={pathData} stroke={colors.pillars.communication} strokeWidth={3} fill="none" />

        {/* Data points */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.pillars.communication} />
        ))}
      </Svg>
    </View>
  );
}

// ─── PaceLineChart Component ──────────────────────────────────────────────────

interface PaceLineChartProps {
  sessions: SpeechSession[];
}

function PaceLineChart({ sessions }: PaceLineChartProps) {
  if (sessions.length === 0) {
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Speaking Pace (WPM)</Text>
        <Text style={styles.emptyText}>No sessions yet</Text>
      </View>
    );
  }

  const width = Dimensions.get('window').width - spacing.lg * 2 - spacing.lg * 2;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const recentSessions = sessions.slice(-10);
  const paces = recentSessions.map((s) => s.paceWpm);
  const maxPace = Math.max(...paces, 200);
  const minPace = Math.min(...paces, 80);

  const points = paces.map((wpm, index) => {
    const x = padding + (index / (paces.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((wpm - minPace) / (maxPace - minPace)) * chartHeight;
    return { x, y, wpm };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Optimal range: 130-160 WPM
  const optimalMinY = padding + chartHeight - ((130 - minPace) / (maxPace - minPace)) * chartHeight;
  const optimalMaxY = padding + chartHeight - ((160 - minPace) / (maxPace - minPace)) * chartHeight;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Speaking Pace (WPM)</Text>
      <Text style={styles.chartSubtitle}>Optimal: 130-160 WPM</Text>
      <Svg width={width} height={height}>
        {/* Optimal zone highlight */}
        <Rect
          x={padding}
          y={optimalMaxY}
          width={chartWidth}
          height={optimalMinY - optimalMaxY}
          fill={colors.success}
          opacity={0.1}
        />
        <Line
          x1={padding}
          y1={optimalMinY}
          x2={width - padding}
          y2={optimalMinY}
          stroke={colors.success}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        <Line
          x1={padding}
          y1={optimalMaxY}
          x2={width - padding}
          y2={optimalMaxY}
          stroke={colors.success}
          strokeWidth={1}
          strokeDasharray="4,4"
        />

        {/* Grid lines */}
        {[100, 130, 160, 200].map((value) => {
          const y = padding + chartHeight - ((value - minPace) / (maxPace - minPace)) * chartHeight;
          return (
            <React.Fragment key={value}>
              <Line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText x={padding - 8} y={y + 4} fontSize={10} fill={colors.textMuted} textAnchor="end">
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Line path */}
        <Path d={pathData} stroke={colors.pillars.communication} strokeWidth={3} fill="none" />

        {/* Data points */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.pillars.communication} />
        ))}
      </Svg>
    </View>
  );
}

// ─── MetricRadarChart Component ───────────────────────────────────────────────

interface MetricRadarChartProps {
  currentSession: SpeechSession | null;
  personalBest: SpeechSession | null;
  firstSession: SpeechSession | null;
}

function MetricRadarChart({ currentSession, personalBest, firstSession }: MetricRadarChartProps) {
  const size = 280;
  const center = size / 2;
  const maxRadius = 100;
  const metrics = [
    'Confidence',
    'Language',
    'Pace',
    'Structure',
    'Opening',
    'Closing',
  ];

  function getPoint(index: number, radius: number) {
    const angle = (Math.PI * 2 * index) / metrics.length - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  }

  function getMetricValue(session: SpeechSession | null, metricIndex: number): number {
    if (!session) return 0;
    switch (metricIndex) {
      case 0: return session.confidenceScore;
      case 1: return session.languageStrength;
      case 2: return (session.paceWpm >= 130 && session.paceWpm <= 160) ? 100 : Math.max(0, 100 - Math.abs(session.paceWpm - 145) * 2);
      case 3: return session.structureScore;
      case 4: return session.openingStrength;
      case 5: return session.closingStrength;
      default: return 0;
    }
  }

  function createPolygon(session: SpeechSession | null): string {
    return metrics
      .map((_, i) => {
        const value = getMetricValue(session, i);
        const r = (value / 100) * maxRadius;
        const p = getPoint(i, r);
        return `${p.x},${p.y}`;
      })
      .join(' ');
  }

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1].map((scale) =>
    metrics.map((_, i) => getPoint(i, maxRadius * scale)).map((p) => `${p.x},${p.y}`).join(' ')
  );

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Metric Radar</Text>
      <View style={styles.radarLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Current</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Best</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.textMuted }]} />
          <Text style={styles.legendText}>First</Text>
        </View>
      </View>
      <Svg width={size} height={size} style={{ alignSelf: 'center' }}>
        {/* Grid rings */}
        {rings.map((points, i) => (
          <Polygon key={i} points={points} fill="none" stroke={colors.border} strokeWidth={1} />
        ))}

        {/* Axis lines */}
        {metrics.map((_, i) => {
          const outer = getPoint(i, maxRadius);
          return (
            <Line key={i} x1={center} y1={center} x2={outer.x} y2={outer.y} stroke={colors.border} strokeWidth={1} />
          );
        })}

        {/* First session polygon */}
        {firstSession && (
          <Polygon
            points={createPolygon(firstSession)}
            fill={colors.textMuted + '22'}
            stroke={colors.textMuted}
            strokeWidth={2}
          />
        )}

        {/* Personal best polygon */}
        {personalBest && (
          <Polygon
            points={createPolygon(personalBest)}
            fill={colors.success + '22'}
            stroke={colors.success}
            strokeWidth={2}
          />
        )}

        {/* Current session polygon */}
        {currentSession && (
          <Polygon
            points={createPolygon(currentSession)}
            fill={colors.primary + '22'}
            stroke={colors.primary}
            strokeWidth={2}
          />
        )}

        {/* Labels */}
        {metrics.map((label, i) => {
          const labelPoint = getPoint(i, maxRadius + 25);
          return (
            <SvgText
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              fontSize={11}
              fill={colors.text}
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

// ─── WeeklyBarChart Component ─────────────────────────────────────────────────

interface WeeklyBarChartProps {
  sessions: SpeechSession[];
}

function WeeklyBarChart({ sessions }: WeeklyBarChartProps) {
  const width = Dimensions.get('window').width - spacing.lg * 2 - spacing.lg * 2;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Group sessions by week (last 8 weeks)
  const now = new Date();
  const weekData: number[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const count = sessions.filter((s) => {
      const sessionDate = new Date(s.createdAt);
      return sessionDate >= weekStart && sessionDate < weekEnd;
    }).length;

    weekData.push(count);
  }

  const maxCount = Math.max(...weekData, 5);
  const barWidth = chartWidth / weekData.length - 8;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Sessions Per Week</Text>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 2, 4, 6].map((value) => {
          const y = padding + chartHeight - (value / maxCount) * chartHeight;
          return (
            <React.Fragment key={value}>
              <Line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText x={padding - 8} y={y + 4} fontSize={10} fill={colors.textMuted} textAnchor="end">
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Bars */}
        {weekData.map((count, i) => {
          const x = padding + i * (chartWidth / weekData.length) + 4;
          const barHeight = (count / maxCount) * chartHeight;
          const y = padding + chartHeight - barHeight;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={colors.pillars.communication}
              rx={4}
            />
          );
        })}
      </Svg>
    </View>
  );
}

// ─── PersonalBestsTable Component ─────────────────────────────────────────────

interface PersonalBestsTableProps {
  progress: SpeechProgress | null;
  sessions: SpeechSession[];
}

function PersonalBestsTable({ progress, sessions }: PersonalBestsTableProps) {
  if (!progress) return null;

  // Find lowest fillers/min
  const lowestFillers = sessions.length > 0
    ? Math.min(...sessions.map((s) => s.fillersPerMinute))
    : 0;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Personal Bests</Text>
      <View style={styles.bestTable}>
        <View style={styles.bestRow}>
          <Text style={styles.bestLabel}>🏆 Best Confidence</Text>
          <Text style={styles.bestValue}>{progress.personalBestConfidence}</Text>
        </View>
        <View style={styles.bestDivider} />
        <View style={styles.bestRow}>
          <Text style={styles.bestLabel}>✨ Lowest Fillers/min</Text>
          <Text style={styles.bestValue}>{lowestFillers.toFixed(1)}</Text>
        </View>
        <View style={styles.bestDivider} />
        <View style={styles.bestRow}>
          <Text style={styles.bestLabel}>🎯 Best Opening</Text>
          <Text style={styles.bestValue}>{progress.personalBestOpening}</Text>
        </View>
        <View style={styles.bestDivider} />
        <View style={styles.bestRow}>
          <Text style={styles.bestLabel}>🎬 Best Closing</Text>
          <Text style={styles.bestValue}>{progress.personalBestClosing}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── SessionHistoryList Component ─────────────────────────────────────────────

interface SessionHistoryListProps {
  sessions: SpeechSession[];
  onSessionPress: (session: SpeechSession) => void;
}

function SessionHistoryList({ sessions, onSessionPress }: SessionHistoryListProps) {
  if (sessions.length === 0) {
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Session History</Text>
        <Text style={styles.emptyText}>No sessions yet</Text>
      </View>
    );
  }

  // Sort by date descending
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Session History</Text>
      <View style={styles.historyList}>
        {sortedSessions.map((session, index) => {
          const date = new Date(session.createdAt);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          // Calculate trend vs previous session
          let trend: 'up' | 'down' | 'neutral' = 'neutral';
          if (index < sortedSessions.length - 1) {
            const prevScore = sortedSessions[index + 1].confidenceScore;
            if (session.confidenceScore > prevScore) trend = 'up';
            else if (session.confidenceScore < prevScore) trend = 'down';
          }

          return (
            <TouchableOpacity
              key={session.id}
              style={styles.historyRow}
              onPress={() => onSessionPress(session)}
              accessibilityRole="button"
              accessibilityLabel={`Session from ${dateStr}`}
            >
              <View style={styles.historyLeft}>
                <Text style={styles.historyDate}>{dateStr}</Text>
                <Text style={styles.historyTopic} numberOfLines={1}>
                  {session.topic}
                </Text>
                <Text style={styles.historyLevel}>Level {session.level}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyScore}>{session.confidenceScore}</Text>
                {trend !== 'neutral' && (
                  <Text style={[styles.historyTrend, { color: trend === 'up' ? colors.success : colors.error }]}>
                    {trend === 'up' ? '↑' : '↓'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProgressDashboard({ navigation, route }: ProgressDashboardProps) {
  const { userId } = route.params;
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SpeechSession[]>([]);
  const [progress, setProgress] = useState<SpeechProgress | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    setLoading(true);
    try {
      const [sessionsData, progressData] = await Promise.all([
        getSessionHistory(userId),
        getSpeechProgress(userId),
      ]);
      setSessions(sessionsData);
      setProgress(progressData);
    } catch (err) {
      console.error('[ProgressDashboard] Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSessionPress(session: SpeechSession) {
    // Navigate to FeedbackScreen with the session data
    navigation.navigate('FeedbackScreen', {
      result: {
        sessionId: session.id,
        confidenceScore: session.confidenceScore,
        languageStrength: session.languageStrength,
        fillersPerMinute: session.fillersPerMinute,
        fillerWords: session.fillerWords,
        fillerPositions: session.fillerPositions,
        paceWpm: session.paceWpm,
        paceScore: 0, // Not stored, would need to recalculate
        structureScore: session.structureScore,
        openingStrength: session.openingStrength,
        closingStrength: session.closingStrength,
        anxiousPauses: session.anxiousPauses,
        purposefulPauses: session.purposefulPauses,
        weakLanguageExamples: session.weakLanguageExamples,
        strongLanguageExamples: session.strongLanguageExamples,
        biggestWin: session.biggestWin ?? '',
        biggestFix: session.biggestFix ?? '',
        openingAnalysis: session.openingAnalysis ?? '',
        closingAnalysis: session.closingAnalysis ?? '',
        comparedToLastSession: session.comparedToLastSession ?? '',
        rexVerdict: session.rexVerdict ?? '',
        rexAudioUrl: session.rexAudioUrl ?? '',
        tomorrowFocus: session.tomorrowFocus ?? '',
        transcript: session.transcript,
        sessionNumber: session.sessionNumber,
      },
    });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const currentSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const personalBestSession = sessions.find((s) => s.confidenceScore === progress?.personalBestConfidence) ?? null;
  const firstSession = sessions.length > 0 ? sessions[0] : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Speaking Progress</Text>
          <View style={{ width: 60 }} />
        </View>

        <ConfidenceLineChart sessions={sessions} />
        <FillersLineChart sessions={sessions} />
        <PaceLineChart sessions={sessions} />
        <MetricRadarChart
          currentSession={currentSession}
          personalBest={personalBestSession}
          firstSession={firstSession}
        />
        <WeeklyBarChart sessions={sessions} />
        <PersonalBestsTable progress={progress} sessions={sessions} />
        <SessionHistoryList sessions={sessions} onSessionPress={handleSessionPress} />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backText: { ...typography.body, color: colors.textMuted },
  headerTitle: { ...typography.h2, color: colors.text },

  // Chart Card
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  chartTitle: { ...typography.h3, color: colors.text },
  chartSubtitle: { ...typography.small, color: colors.textMuted, marginTop: -spacing.sm },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },

  // Trend Badge
  trendBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  trendText: { ...typography.small, fontWeight: '600' },

  // Radar Legend
  radarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { ...typography.small, color: colors.textMuted },

  // Personal Bests Table
  bestTable: { gap: spacing.sm },
  bestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  bestLabel: { ...typography.body, color: colors.text },
  bestValue: { ...typography.bodyBold, color: colors.primary, fontSize: 18 },
  bestDivider: { height: 1, backgroundColor: colors.border },

  // Session History
  historyList: { gap: spacing.sm },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  historyLeft: { flex: 1, gap: spacing.xs },
  historyDate: { ...typography.small, color: colors.textMuted },
  historyTopic: { ...typography.body, color: colors.text },
  historyLevel: { ...typography.caption, color: colors.pillars.communication },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  historyScore: { ...typography.h3, color: colors.text },
  historyTrend: { ...typography.h3, fontSize: 20 },
});
