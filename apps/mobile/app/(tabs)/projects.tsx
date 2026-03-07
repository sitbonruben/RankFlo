import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Alert,
  TextInput,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

interface Project {
  id: string;
  name: string;
  url: string;
  platform: 'web' | 'app';
  postsCount: number;
  viewsTotal: string;
  status: 'active' | 'paused';
  lastUpdated: string;
  favicon: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Tech Blog',
    url: 'techblog.com',
    platform: 'web',
    postsCount: 24,
    viewsTotal: '12.4K',
    status: 'active',
    lastUpdated: '2 hours ago',
    favicon: 'T',
  },
  {
    id: '2',
    name: 'Marketing Site',
    url: 'acme.io/blog',
    platform: 'web',
    postsCount: 8,
    viewsTotal: '3.1K',
    status: 'active',
    lastUpdated: '1 day ago',
    favicon: 'M',
  },
  {
    id: '3',
    name: 'Mobile App Blog',
    url: 'app.rankflo.io',
    platform: 'app',
    postsCount: 3,
    viewsTotal: '890',
    status: 'paused',
    lastUpdated: '5 days ago',
    favicon: 'A',
  },
];

type FilterOption = 'all' | 'active' | 'paused';

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused' },
];

function ProjectCard({
  project,
  onPress,
}: {
  project: Project;
  onPress: () => void;
}) {
  const isActive = project.status === 'active';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.faviconCircle}>
          <Text style={styles.faviconText}>{project.favicon}</Text>
        </View>
        <Text style={styles.projectName} numberOfLines={1}>
          {project.name}
        </Text>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: isActive ? colors.accent : '#FFAA00',
            },
          ]}
        />
      </View>

      <Text style={styles.projectUrl}>{project.url}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="document-text-outline" size={14} color={colors.gray[500]} />
          <Text style={styles.statText}>{project.postsCount} posts</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={14} color={colors.gray[500]} />
          <Text style={styles.statText}>{project.viewsTotal} views</Text>
        </View>
        <View style={styles.platformBadge}>
          <Ionicons
            name={project.platform === 'web' ? 'globe-outline' : 'phone-portrait-outline'}
            size={12}
            color={colors.accent}
          />
          <Text style={styles.platformText}>{project.platform}</Text>
        </View>
      </View>

      <View style={styles.cardBottomRow}>
        <Text style={styles.lastUpdated}>Updated {project.lastUpdated}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.gray[600]} />
      </View>
    </Pressable>
  );
}

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const searchAnim = useRef(new Animated.Value(0)).current;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const toggleSearch = useCallback(() => {
    if (searchActive) {
      Animated.timing(searchAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        setSearchActive(false);
        setSearchQuery('');
      });
    } else {
      setSearchActive(true);
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [searchActive, searchAnim]);

  const filteredProjects = useMemo(() => {
    let projects = MOCK_PROJECTS;

    if (activeFilter !== 'all') {
      projects = projects.filter((p) => p.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.url.toLowerCase().includes(query),
      );
    }

    return projects;
  }, [activeFilter, searchQuery]);

  const handleAddProject = () => {
    Alert.alert(
      'Add Project',
      'Connect a new website or app',
      [{ text: 'OK' }],
    );
  };

  const handleProjectPress = (project: Project) => {
    Alert.alert(project.name, `Navigate to /project/${project.id}`);
  };

  const searchInputWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        {searchActive ? (
          <Animated.View style={[styles.searchContainer, { opacity: searchAnim }]}>
            <Ionicons name="search" size={18} color={colors.gray[500]} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search projects..."
              placeholderTextColor={colors.gray[500]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={toggleSearch} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.gray[500]} />
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.headerTop}>
            <Text style={styles.title}>Projects</Text>
            <View style={styles.headerActions}>
              <Pressable
                onPress={toggleSearch}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
                hitSlop={8}
              >
                <Ionicons name="search-outline" size={22} color={colors.white} />
              </Pressable>
              <Pressable
                onPress={handleAddProject}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                ]}
              >
                <Ionicons name="add" size={20} color={colors.black} />
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScroll}
      >
        {FILTERS.map((filter) => {
          const isSelected = activeFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[
                styles.filterPill,
                isSelected && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isSelected && styles.filterPillTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Projects list */}
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => handleProjectPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color={colors.gray[600]} />
            <Text style={styles.emptyTitle}>No projects found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first project to get started'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
  },
  iconButtonPressed: {
    opacity: 0.6,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.white,
    height: 44,
  },

  // Filters
  filtersScroll: {
    maxHeight: 44,
  },
  filtersContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  filterPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterPillText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.gray[400],
  },
  filterPillTextActive: {
    color: colors.black,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['5xl'],
    paddingTop: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },

  // Card
  card: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: colors.gray[800],
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  faviconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  faviconText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.black,
  },
  projectName: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
  projectUrl: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.md,
    marginLeft: spacing['5xl'],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  platformText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'uppercase',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
