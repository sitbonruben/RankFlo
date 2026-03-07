import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

function OptionCard({
  icon,
  iconColor,
  title,
  description,
  accentBorder,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
  accentBorder?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        accentBorder && styles.cardAccent,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.cardIcon, accentBorder && styles.cardIconAccent]}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray[600]} />
    </Pressable>
  );
}

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Modal handle bar */}
      <View style={styles.handleBar} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>New Post</Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
          hitSlop={12}
        >
          <Ionicons name="close" size={22} color={colors.gray[400]} />
        </Pressable>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>How would you like to start?</Text>

      {/* Options */}
      <View style={styles.options}>
        <OptionCard
          icon="sparkles"
          iconColor={colors.accent}
          title="Write with AI"
          description="Let AI help you draft, outline, or rewrite your post"
          accentBorder
          onPress={() =>
            Alert.alert(
              'AI Writer',
              'AI-powered writing assistant coming soon! You\'ll be able to generate outlines, drafts, and get suggestions as you write.',
            )
          }
        />

        <OptionCard
          icon="document-text-outline"
          iconColor={colors.white}
          title="Start from scratch"
          description="Open the block editor with a blank canvas"
          onPress={() =>
            Alert.alert(
              'Block Editor',
              'The mobile block editor is coming soon! For now, use the web app at rankflo.io to create posts with the full visual editor.',
            )
          }
        />

        <OptionCard
          icon="copy-outline"
          iconColor={colors.white}
          title="Use a template"
          description="Pick from pre-built blog templates"
          onPress={() =>
            Alert.alert(
              'Templates',
              'Choose from 6 professional templates: Minimal Blog, Technical Tutorial, Marketing Launch, Listicle, Newsletter, and Case Study.',
            )
          }
        />

        <OptionCard
          icon="mic-outline"
          iconColor={colors.white}
          title="Voice to post"
          description="Dictate your ideas and convert to a blog post"
          onPress={() =>
            Alert.alert(
              'Voice to Post',
              'Voice recording with AI transcription coming soon! Speak your ideas and we\'ll turn them into a polished blog post.',
            )
          }
        />
      </View>

      {/* Quick tip */}
      <View style={styles.tipBox}>
        <Ionicons name="bulb-outline" size={16} color={colors.accent} />
        <Text style={styles.tipText}>
          Tip: You can also quick-draft from the Feed by tapping the + button
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[950],
  },
  handleBar: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gray[600],
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.white,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnPressed: {
    backgroundColor: colors.gray[700],
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.gray[500],
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  options: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[800],
    gap: spacing.lg,
  },
  cardAccent: {
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  cardPressed: {
    opacity: 0.8,
    backgroundColor: colors.gray[800],
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconAccent: {
    backgroundColor: colors.accentDim,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    lineHeight: 18,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentDim,
    borderRadius: borderRadius.lg,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.gray[400],
    lineHeight: 18,
  },
});
