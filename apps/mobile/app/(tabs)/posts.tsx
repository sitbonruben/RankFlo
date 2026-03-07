import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

type PostStatus = 'published' | 'draft' | 'scheduled';
type FilterOption = 'all' | PostStatus;
type SortOption = 'latest' | 'popular' | 'a-z';

interface UserPost {
  id: string;
  title: string;
  status: PostStatus;
  project: string;
  views: number;
  date: string;
  readTime: string;
  scheduledDate?: string;
}

const MOCK_POSTS: UserPost[] = [
  {
    id: '1',
    title: 'Getting Started with RankFlo',
    status: 'published',
    project: 'Tech Blog',
    views: 1240,
    date: '2026-03-01',
    readTime: '5 min',
  },
  {
    id: '2',
    title: 'Advanced SEO Strategies',
    status: 'published',
    project: 'Tech Blog',
    views: 890,
    date: '2026-02-28',
    readTime: '8 min',
  },
  {
    id: '3',
    title: 'Content Marketing Guide',
    status: 'draft',
    project: 'Marketing Site',
    views: 0,
    date: '2026-03-04',
    readTime: '12 min',
  },
  {
    id: '4',
    title: 'React Native Best Practices',
    status: 'published',
    project: 'Tech Blog',
    views: 2100,
    date: '2026-02-25',
    readTime: '10 min',
  },
  {
    id: '5',
    title: 'Product Launch Announcement',
    status: 'scheduled',
    project: 'Marketing Site',
    views: 0,
    date: '2026-03-15',
    readTime: '3 min',
    scheduledDate: 'Mar 15',
  },
  {
    id: '6',
    title: 'Building an Audience',
    status: 'draft',
    project: 'Tech Blog',
    views: 0,
    date: '2026-03-03',
    readTime: '7 min',
  },
  {
    id: '7',
    title: 'Email Newsletter Tips',
    status: 'published',
    project: 'Marketing Site',
    views: 450,
    date: '2026-02-20',
    readTime: '4 min',
  },
  {
    id: '8',
    title: 'API Documentation Guide',
    status: 'draft',
    project: 'Mobile App Blog',
    views: 0,
    date: '2026-03-05',
    readTime: '15 min',
  },
];

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
  { key: 'scheduled', label: 'Scheduled' },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'latest', label: 'Latest' },
  { key: 'popular', label: 'Popular' },
  { key: 'a-z', label: 'A-Z' },
];

const STATUS_CONFIG: Record<
  PostStatus,
  { color: string; label: string; icon: string }
> = {
  published: { color: colors.accent, label: 'Published', icon: 'checkmark-circle' },
  draft: { color: '#FFAA00', label: 'Draft', icon: 'create-outline' },
  scheduled: { color: '#4A9EFF', label: 'Scheduled', icon: 'time-outline' },
};

function PostCard({
  post,
  onLongPress,
}: {
  post: UserPost;
  onLongPress: () => void;
}) {
  const statusConf = STATUS_CONFIG[post.status];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onLongPress={onLongPress}
    >
      {/* Status row */}
      <View style={styles.statusRow}>
        <View
          style={[styles.statusDot, { backgroundColor: statusConf.color }]}
        />
        <Text style={[styles.statusText, { color: statusConf.color }]}>
          {statusConf.label}
        </Text>
        {post.scheduledDate && (
          <Text style={styles.scheduledDate}>{post.scheduledDate}</Text>
        )}
      </View>

      {/* Title */}
      <Text style={styles.postTitle} numberOfLines={2}>
        {post.title}
      </Text>

      {/* Project pill */}
      <View style={styles.projectPill}>
        <Text style={styles.projectPillText}>{post.project}</Text>
      </View>

      {/* Bottom row */}
      <View style={styles.cardBottom}>
        <View style={styles.cardMetaItem}>
          <Ionicons name="eye-outline" size={14} color={colors.gray[500]} />
          <Text style={styles.cardMetaText}>
            {post.views > 0 ? post.views.toLocaleString() : '--'}
          </Text>
        </View>
        <View style={styles.cardMetaItem}>
          <Ionicons name="time-outline" size={14} color={colors.gray[500]} />
          <Text style={styles.cardMetaText}>{post.readTime}</Text>
        </View>
        <View style={styles.cardMetaItem}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={colors.gray[500]}
          />
          <Text style={styles.cardMetaText}>
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function PostsScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const filteredPosts = useMemo(() => {
    let posts = [...MOCK_POSTS];

    // Filter by status
    if (activeFilter !== 'all') {
      posts = posts.filter((p) => p.status === activeFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.project.toLowerCase().includes(query),
      );
    }

    // Sort
    switch (sortBy) {
      case 'latest':
        posts.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        break;
      case 'popular':
        posts.sort((a, b) => b.views - a.views);
        break;
      case 'a-z':
        posts.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return posts;
  }, [activeFilter, sortBy, searchQuery]);

  const handleNewPost = () => {
    Alert.alert('New Post', 'Create a new post');
  };

  const handlePostActions = (post: UserPost) => {
    Alert.alert(post.title, 'Choose an action', [
      { text: 'Edit', onPress: () => {} },
      { text: 'Duplicate', onPress: () => {} },
      { text: 'Delete', style: 'destructive', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getEmptyMessage = () => {
    if (searchQuery.trim()) return 'No posts match your search';
    switch (activeFilter) {
      case 'published':
        return 'No published posts';
      case 'draft':
        return 'No draft posts';
      case 'scheduled':
        return 'No scheduled posts';
      default:
        return 'No posts yet';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Posts</Text>
          <Pressable
            onPress={handleNewPost}
            style={({ pressed }) => [
              styles.newPostButton,
              pressed && styles.newPostButtonPressed,
            ]}
          >
            <Ionicons name="add" size={22} color={colors.black} />
          </Pressable>
        </View>
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

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.gray[500]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          placeholderTextColor={colors.gray[500]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.gray[500]} />
          </Pressable>
        )}
      </View>

      {/* Sort row */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {SORT_OPTIONS.map((opt) => {
          const isSelected = sortBy === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setSortBy(opt.key)}
              style={[styles.sortChip, isSelected && styles.sortChipActive]}
            >
              <Text
                style={[
                  styles.sortChipText,
                  isSelected && styles.sortChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Posts list */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onLongPress={() => handlePostActions(item)} />
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
            <Ionicons
              name={
                activeFilter === 'draft'
                  ? 'create-outline'
                  : activeFilter === 'scheduled'
                    ? 'time-outline'
                    : 'document-text-outline'
              }
              size={48}
              color={colors.gray[600]}
            />
            <Text style={styles.emptyTitle}>{getEmptyMessage()}</Text>
            <Text style={styles.emptySubtitle}>
              Posts you create will appear here
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
    paddingBottom: spacing.sm,
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
  newPostButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPostButtonPressed: {
    opacity: 0.8,
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

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 42,
    marginHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.white,
    height: 42,
  },

  // Sort
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  sortLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginRight: spacing.xs,
  },
  sortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[900],
  },
  sortChipActive: {
    backgroundColor: colors.accentDim,
  },
  sortChipText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.gray[500],
  },
  sortChipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['5xl'],
  },
  separator: {
    height: spacing.sm,
  },

  // Card
  card: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: colors.gray[800],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  scheduledDate: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginLeft: spacing.sm,
  },
  postTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  projectPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[800],
    marginBottom: spacing.md,
  },
  projectPillText: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    fontWeight: '500',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardMetaText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },

  // Empty
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
