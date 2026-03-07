import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

type Period = '7d' | '30d' | '90d' | '1y';

interface OverviewStat {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

interface TopPost {
  rank: number;
  title: string;
  views: number;
  trending: 'up' | 'down' | 'neutral';
}

interface TrafficSource {
  label: string;
  percentage: number;
  color: string;
}

interface Country {
  name: string;
  flag: string;
  percentage: number;
}

const PERIODS: Period[] = ['7d', '30d', '90d', '1y'];

const OVERVIEW_STATS: Record<Period, OverviewStat[]> = {
  '7d': [
    { label: 'Total Views', value: '12,847', change: '+14.2%', positive: true, icon: 'eye-outline' },
    { label: 'Unique Visitors', value: '3,241', change: '+8.1%', positive: true, icon: 'people-outline' },
    { label: 'Avg Read Time', value: '4.2m', change: '+12%', positive: true, icon: 'time-outline' },
    { label: 'Engagement', value: '67%', change: '+5.3%', positive: true, icon: 'heart-outline' },
  ],
  '30d': [
    { label: 'Total Views', value: '48,320', change: '+22.5%', positive: true, icon: 'eye-outline' },
    { label: 'Unique Visitors', value: '12,180', change: '+15.3%', positive: true, icon: 'people-outline' },
    { label: 'Avg Read Time', value: '3.8m', change: '-2.1%', positive: false, icon: 'time-outline' },
    { label: 'Engagement', value: '62%', change: '+3.7%', positive: true, icon: 'heart-outline' },
  ],
  '90d': [
    { label: 'Total Views', value: '142,500', change: '+31.0%', positive: true, icon: 'eye-outline' },
    { label: 'Unique Visitors', value: '35,600', change: '+18.2%', positive: true, icon: 'people-outline' },
    { label: 'Avg Read Time', value: '4.0m', change: '+5.4%', positive: true, icon: 'time-outline' },
    { label: 'Engagement', value: '64%', change: '+7.1%', positive: true, icon: 'heart-outline' },
  ],
  '1y': [
    { label: 'Total Views', value: '524,100', change: '+45.8%', positive: true, icon: 'eye-outline' },
    { label: 'Unique Visitors', value: '128,400', change: '+38.2%', positive: true, icon: 'people-outline' },
    { label: 'Avg Read Time', value: '3.9m', change: '+1.2%', positive: true, icon: 'time-outline' },
    { label: 'Engagement', value: '59%', change: '-2.1%', positive: false, icon: 'heart-outline' },
  ],
};

const CHART_DATA_7D = [
  { label: 'Mon', value: 1842 },
  { label: 'Tue', value: 2150 },
  { label: 'Wed', value: 1680 },
  { label: 'Thu', value: 2420 },
  { label: 'Fri', value: 1950 },
  { label: 'Sat', value: 1240 },
  { label: 'Sun', value: 1565 },
];

const CHART_DATA_30D = [
  { label: 'W1', value: 8200 },
  { label: 'W2', value: 9450 },
  { label: 'W3', value: 7800 },
  { label: 'W4', value: 12870 },
];

const TOP_POSTS: TopPost[] = [
  { rank: 1, title: 'React Native Best Practices', views: 2100, trending: 'up' },
  { rank: 2, title: 'Getting Started with RankFlo', views: 1240, trending: 'up' },
  { rank: 3, title: 'Advanced SEO Strategies', views: 890, trending: 'down' },
  { rank: 4, title: 'Email Newsletter Tips', views: 450, trending: 'neutral' },
  { rank: 5, title: 'Content Marketing Guide', views: 320, trending: 'up' },
];

const TRAFFIC_SOURCES: TrafficSource[] = [
  { label: 'Direct', percentage: 45, color: colors.accent },
  { label: 'Search', percentage: 30, color: '#4A9EFF' },
  { label: 'Social', percentage: 15, color: '#FFAA00' },
  { label: 'Referral', percentage: 10, color: '#FF6B6B' },
];

const TOP_COUNTRIES: Country[] = [
  { name: 'United States', flag: 'US', percentage: 45 },
  { name: 'United Kingdom', flag: 'UK', percentage: 12 },
  { name: 'Germany', flag: 'DE', percentage: 8 },
  { name: 'Canada', flag: 'CA', percentage: 7 },
  { name: 'France', flag: 'FR', percentage: 5 },
];

function StatCard({ stat }: { stat: OverviewStat }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconRow}>
        <View style={styles.statIconCircle}>
          <Ionicons name={stat.icon} size={16} color={colors.accent} />
        </View>
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <View style={styles.statChangeRow}>
        <Ionicons
          name={stat.positive ? 'arrow-up' : 'arrow-down'}
          size={12}
          color={stat.positive ? colors.accent : colors.red}
        />
        <Text
          style={[
            styles.statChange,
            { color: stat.positive ? colors.accent : colors.red },
          ]}
        >
          {stat.change}
        </Text>
      </View>
    </View>
  );
}

function BarChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const maxIndex = data.findIndex((d) => d.value === maxValue);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Views Over Time</Text>
      <View style={styles.chartBody}>
        {data.map((bar, index) => {
          const height = (bar.value / maxValue) * 140;
          const isHighlighted = index === maxIndex;
          return (
            <View key={index} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: isHighlighted
                      ? colors.accent
                      : colors.gray[700],
                  },
                ]}
              />
              <Text
                style={[
                  styles.barLabel,
                  isHighlighted && { color: colors.accent },
                ]}
              >
                {bar.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TopPostRow({ post }: { post: TopPost }) {
  const trendIcon =
    post.trending === 'up'
      ? 'trending-up'
      : post.trending === 'down'
        ? 'trending-down'
        : 'remove-outline';
  const trendColor =
    post.trending === 'up'
      ? colors.accent
      : post.trending === 'down'
        ? colors.red
        : colors.gray[500];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.topPostRow,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{post.rank}</Text>
      </View>
      <View style={styles.topPostInfo}>
        <Text style={styles.topPostTitle} numberOfLines={1}>
          {post.title}
        </Text>
        <Text style={styles.topPostViews}>
          {post.views.toLocaleString()} views
        </Text>
      </View>
      <Ionicons name={trendIcon as any} size={18} color={trendColor} />
    </Pressable>
  );
}

function TrafficSourceBar({ source }: { source: TrafficSource }) {
  return (
    <View style={styles.trafficRow}>
      <View style={styles.trafficLabelRow}>
        <Text style={styles.trafficLabel}>{source.label}</Text>
        <Text style={styles.trafficPercent}>{source.percentage}%</Text>
      </View>
      <View style={styles.trafficBarTrack}>
        <View
          style={[
            styles.trafficBarFill,
            {
              width: `${source.percentage}%`,
              backgroundColor: source.color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function CountryRow({ country }: { country: Country }) {
  return (
    <View style={styles.countryRow}>
      <View style={styles.countryFlag}>
        <Text style={styles.countryFlagText}>{country.flag}</Text>
      </View>
      <Text style={styles.countryName}>{country.name}</Text>
      <Text style={styles.countryPercent}>{country.percentage}%</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('7d');

  const stats = OVERVIEW_STATS[period];
  const chartData = useMemo(() => {
    if (period === '7d') return CHART_DATA_7D;
    return CHART_DATA_30D;
  }, [period]);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.periodRow}>
          {PERIODS.map((p) => {
            const isSelected = period === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.periodPill,
                  isSelected && styles.periodPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.periodPillText,
                    isSelected && styles.periodPillTextActive,
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Overview stat cards - 2x2 grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsGridRow}>
          <StatCard stat={stats[0]} />
          <StatCard stat={stats[1]} />
        </View>
        <View style={styles.statsGridRow}>
          <StatCard stat={stats[2]} />
          <StatCard stat={stats[3]} />
        </View>
      </View>

      {/* Views Over Time chart */}
      <BarChart data={chartData} />

      {/* Top Posts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Posts</Text>
        {TOP_POSTS.map((post) => (
          <TopPostRow key={post.rank} post={post} />
        ))}
      </View>

      {/* Traffic Sources */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Traffic Sources</Text>
        <View style={styles.trafficCard}>
          {TRAFFIC_SOURCES.map((source) => (
            <TrafficSourceBar key={source.label} source={source} />
          ))}
        </View>
      </View>

      {/* Top Countries */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Countries</Text>
        <View style={styles.countriesCard}>
          {TOP_COUNTRIES.map((country) => (
            <CountryRow key={country.flag} country={country} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    paddingBottom: spacing['5xl'] * 2,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  periodPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  periodPillText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.gray[400],
  },
  periodPillTextActive: {
    color: colors.black,
    fontWeight: '600',
  },

  // Stats grid
  statsGrid: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  statsGridRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  statIconRow: {
    marginBottom: spacing.sm,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  statChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.xs,
  },
  statChange: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },

  // Chart
  chartContainer: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  chartBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '75%',
    borderRadius: borderRadius.sm,
    minHeight: 6,
  },
  barLabel: {
    fontSize: 10,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },

  // Sections
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.md,
  },

  // Top posts
  topPostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.gray[300],
  },
  topPostInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  topPostTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.white,
    marginBottom: 2,
  },
  topPostViews: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },

  // Traffic sources
  trafficCard: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: spacing.md,
  },
  trafficRow: {
    gap: spacing.xs,
  },
  trafficLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trafficLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.white,
  },
  trafficPercent: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[400],
  },
  trafficBarTrack: {
    height: 8,
    backgroundColor: colors.gray[800],
    borderRadius: 4,
  },
  trafficBarFill: {
    height: 8,
    borderRadius: 4,
  },

  // Countries
  countriesCard: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: spacing.md,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    width: 32,
    height: 22,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  countryFlagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray[400],
  },
  countryName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  countryPercent: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[400],
  },
});
