import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_POST = {
  title: 'Getting Started with RankFlo',
  author: {
    name: 'Jane Doe',
    initials: 'JD',
  },
  date: '2026-03-01',
  readTime: '5 min read',
  views: 1284,
  tags: ['Tutorial', 'Getting Started', 'Blogging', 'Platform'],
  likes: 124,
  comments: 18,
};

const CODE_SNIPPET = `import { createBlog } from '@rankflo/core';

const blog = createBlog({
  title: 'My Awesome Blog',
  theme: 'minimal-dark',
  plugins: ['seo', 'analytics', 'rss'],
});

await blog.publish();`;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TagPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      <View style={styles.tag}>
        <Text style={styles.tagText}>{label}</Text>
      </View>
    </Pressable>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <View style={styles.checkItem}>
      <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
      <Text style={styles.checkItemText}>{text}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function PostDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const likeCount = liked ? MOCK_POST.likes + 1 : MOCK_POST.likes;

  // ---------- Handlers ----------

  const handleMore = () => {
    Alert.alert('Post Options', undefined, [
      { text: 'Edit', onPress: () => Alert.alert('Edit', 'Opening editor...') },
      { text: 'Duplicate', onPress: () => Alert.alert('Duplicate', 'Post duplicated to drafts.') },
      {
        text: 'Move to Trash',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Trash', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => router.back() },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share this post via link, Twitter, or copy URL.', [
      { text: 'Copy Link', onPress: () => Alert.alert('Copied', 'Link copied to clipboard.') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleCopyCode = () => {
    Alert.alert('Copied!', 'Code snippet copied to clipboard.');
  };

  const handleTagPress = (tag: string) => {
    Alert.alert('Tag', `Viewing posts tagged "${tag}" coming soon.`);
  };

  const formattedDate = new Date(MOCK_POST.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Sticky header */}
      <View style={styles.navBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>

        <Text style={styles.navTitle} numberOfLines={1}>
          {MOCK_POST.title}
        </Text>

        <View style={styles.navRight}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
            hitSlop={8}
          >
            <Ionicons name="share-outline" size={20} color={colors.white} />
          </Pressable>
          <Pressable
            onPress={handleMore}
            style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
            hitSlop={8}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.white} />
          </Pressable>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image placeholder */}
        <LinearGradient
          colors={[colors.gray[900], colors.gray[800]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroImage}
        >
          <Ionicons name="image-outline" size={48} color={colors.gray[700]} />
          <Text style={styles.heroPlaceholder}>Cover Image</Text>
        </LinearGradient>

        {/* Tags row */}
        <View style={styles.tagsRow}>
          {MOCK_POST.tags.map((tag) => (
            <TagPill key={tag} label={tag} onPress={() => handleTagPress(tag)} />
          ))}
        </View>

        {/* Title */}
        <Text style={styles.title}>{MOCK_POST.title}</Text>

        {/* Author row */}
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{MOCK_POST.author.initials}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{MOCK_POST.author.name}</Text>
            <Text style={styles.metaText}>
              {formattedDate}  {'\u00B7'}  {MOCK_POST.readTime}  {'\u00B7'}  {MOCK_POST.views.toLocaleString()} views
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* ---- Article body ---- */}

        {/* Introduction */}
        <Text style={styles.paragraph}>
          RankFlo is a modern publishing platform built for developers and writers who want a
          clean, fast, and fully customizable blogging experience. Whether you are sharing
          technical tutorials, personal stories, or creative writing, RankFlo gives you the
          tools to publish beautifully.
        </Text>

        {/* Getting Started heading */}
        <Text style={styles.h2}>Getting Started</Text>

        <Text style={styles.paragraph}>
          Setting up your first blog takes less than five minutes. Create an account, choose a
          theme, and start writing with our powerful block editor. Everything is designed to
          get out of your way so you can focus on what matters: your content.
        </Text>

        {/* Tip / callout box */}
        <View style={styles.calloutBox}>
          <Text style={styles.calloutText}>
            <Text style={styles.calloutPrefix}>Pro tip: </Text>
            Use keyboard shortcuts to speed up your editing workflow. Press Cmd+K to insert a
            link, Cmd+B for bold, and Cmd+Shift+H for a heading.
          </Text>
        </View>

        {/* Key Features heading */}
        <Text style={styles.h2}>Key Features</Text>

        <View style={styles.checkList}>
          <CheckItem text="Markdown and block editor with live preview" />
          <CheckItem text="Built-in analytics and reader engagement metrics" />
          <CheckItem text="SEO optimization tools for every post" />
          <CheckItem text="Custom themes and full CSS control" />
          <CheckItem text="RSS feeds and newsletter integration" />
          <CheckItem text="AI-powered writing suggestions" />
        </View>

        {/* Code snippet */}
        <View style={styles.codeBlock}>
          <View style={styles.codeHeader}>
            <Text style={styles.codeHeaderLabel}>TypeScript</Text>
            <Pressable
              onPress={handleCopyCode}
              style={({ pressed }) => [styles.copyBtn, pressed && styles.copyBtnPressed]}
            >
              <Ionicons name="copy-outline" size={14} color={colors.gray[400]} />
              <Text style={styles.copyBtnText}>Copy</Text>
            </Pressable>
          </View>
          <Text style={styles.codeText}>{CODE_SNIPPET}</Text>
        </View>

        {/* Conclusion */}
        <Text style={styles.paragraph}>
          That is everything you need to get started. Explore the dashboard, customize your
          blog settings, and publish your first post. The RankFlo community is here to help
          if you have any questions along the way. Happy writing!
        </Text>

        {/* Bottom spacing for engagement bar */}
        <View style={{ height: spacing['5xl'] + 20 }} />
      </ScrollView>

      {/* Fixed engagement bar */}
      <View style={[styles.engagementBar, { paddingBottom: insets.bottom || spacing.lg }]}>
        <View style={styles.engagementInner}>
          {/* Like */}
          <Pressable
            onPress={() => setLiked((v) => !v)}
            style={({ pressed }) => [styles.engageBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? colors.red : colors.gray[400]}
            />
            <Text style={[styles.engageCount, liked && styles.engageCountActive]}>
              {likeCount}
            </Text>
          </Pressable>

          {/* Comment */}
          <Pressable
            onPress={() => Alert.alert('Comments', 'Comment section coming soon.')}
            style={({ pressed }) => [styles.engageBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.gray[400]} />
            <Text style={styles.engageCount}>{MOCK_POST.comments}</Text>
          </Pressable>

          {/* Bookmark */}
          <Pressable
            onPress={() => setBookmarked((v) => !v)}
            style={({ pressed }) => [styles.engageBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={bookmarked ? colors.accent : colors.gray[400]}
            />
          </Pressable>

          {/* Share */}
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [styles.engageBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="share-outline" size={20} color={colors.gray[400]} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },

  // Navigation bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[900],
    gap: spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPressed: {
    backgroundColor: colors.gray[800],
  },
  navTitle: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
  },
  navRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },

  // Hero image
  heroImage: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroPlaceholder: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing.sm,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.accentDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.accent,
  },

  // Title
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 36,
    letterSpacing: -0.5,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },

  // Author
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.black,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.gray[800],
    marginHorizontal: spacing.xl,
    marginVertical: spacing.xl,
  },

  // Body text
  paragraph: {
    fontSize: fontSize.base,
    color: colors.gray[300],
    lineHeight: 26,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    lineHeight: 30,
  },

  // Callout
  calloutBox: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.gray[900],
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  calloutText: {
    fontSize: fontSize.sm,
    color: colors.gray[300],
    lineHeight: 22,
  },
  calloutPrefix: {
    fontWeight: '700',
    color: colors.accent,
  },

  // Checklist
  checkList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkItemText: {
    fontSize: fontSize.base,
    color: colors.gray[300],
    lineHeight: 22,
    flex: 1,
  },

  // Code block
  codeBlock: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[800],
  },
  codeHeaderLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    fontWeight: '500',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  copyBtnPressed: {
    backgroundColor: colors.gray[800],
  },
  copyBtnText: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: fontSize.xs,
    color: colors.gray[300],
    lineHeight: 20,
    padding: spacing.lg,
  },

  // Engagement bar
  engagementBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
    borderTopWidth: 1,
    borderTopColor: colors.gray[900],
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  engagementInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  engageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  engageCount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[400],
  },
  engageCountActive: {
    color: colors.red,
  },
});
