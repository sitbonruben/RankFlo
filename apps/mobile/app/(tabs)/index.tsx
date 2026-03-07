import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  status: 'published' | 'draft';
  author: {
    name: string;
    avatarUrl?: string;
  };
}

// Placeholder data until tRPC queries are connected
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    slug: 'getting-started-with-rankflo',
    title: 'Getting Started with RankFlo',
    excerpt:
      'Learn how to set up your blog and start publishing content in minutes with our comprehensive guide.',
    date: '2026-03-01',
    status: 'published',
    author: { name: 'Jane Doe' },
  },
  {
    id: '2',
    slug: 'mastering-markdown',
    title: 'Mastering Markdown for Blog Posts',
    excerpt:
      'A deep dive into advanced markdown techniques that will make your posts stand out from the crowd.',
    date: '2026-02-28',
    status: 'published',
    author: { name: 'John Smith' },
  },
  {
    id: '3',
    slug: 'seo-tips-for-bloggers',
    title: 'SEO Tips for Modern Bloggers',
    excerpt:
      'Practical strategies to improve your search engine rankings and drive organic traffic to your blog.',
    date: '2026-02-25',
    status: 'published',
    author: { name: 'Alice Chen' },
  },
  {
    id: '4',
    slug: 'building-an-audience',
    title: 'Building an Audience from Scratch',
    excerpt:
      'Proven methods to grow your readership and build a loyal community around your content.',
    date: '2026-02-20',
    status: 'draft',
    author: { name: 'Bob Martin' },
  },
];

function StatusBadge({ status }: { status: Post['status'] }) {
  const isPublished = status === 'published';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isPublished ? colors.accentDim : 'rgba(255, 255, 255, 0.08)',
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: isPublished ? colors.accent : colors.gray[400] },
        ]}
      >
        {isPublished ? 'Published' : 'Draft'}
      </Text>
    </View>
  );
}

function PostCard({ post, onPress }: { post: Post; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <StatusBadge status={post.status} />
        <Text style={styles.cardDate}>
          {new Date(post.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {post.title}
      </Text>
      <Text style={styles.cardExcerpt} numberOfLines={2}>
        {post.excerpt}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>
              {post.author.name.charAt(0)}
            </Text>
          </View>
          <Text style={styles.authorName}>{post.author.name}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate network request — replace with trpc query refetch
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handlePostPress = (slug: string) => {
    router.push(`/post/${slug}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>RankFlo</Text>
          <View style={styles.accentDot} />
        </View>
        <Text style={styles.subtitle}>Your feed</Text>
      </View>

      <FlatList
        data={MOCK_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onPress={() => handlePostPress(item.slug)} />
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['5xl'],
  },
  separator: {
    height: spacing.md,
  },
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  cardExcerpt: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.white,
  },
  authorName: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
  },
});
