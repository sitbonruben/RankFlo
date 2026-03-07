import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { logout } from '@/lib/auth';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ---------------------------------------------------------------------------
// Reusable row components
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  isLast,
  right,
}: {
  icon: IoniconsName;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
  right?: React.ReactNode;
}) {
  const inner = (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={colors.gray[400]} style={styles.rowIcon} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {right ?? (
          <>
            {value ? <Text style={styles.rowValue}>{value}</Text> : null}
            <Ionicons name="chevron-forward" size={16} color={colors.gray[600]} />
          </>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.rowPressed}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

function SwitchRow({
  icon,
  label,
  value,
  onValueChange,
  isLast,
}: {
  icon: IoniconsName;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <SettingsRow
      icon={icon}
      label={label}
      isLast={isLast}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.gray[700], true: colors.accent }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.gray[700]}
        />
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Edit Profile Modal
// ---------------------------------------------------------------------------

function EditProfileModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane@rankflo.io');
  const [bio, setBio] = useState('Writer, developer, and coffee enthusiast.');

  const handleSave = () => {
    Alert.alert('Profile Updated', 'Your profile changes have been saved.');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.gray[400]} />
            </Pressable>
          </View>

          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholderTextColor={colors.gray[600]}
              placeholder="Your name"
            />
          </View>

          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Email</Text>
            <TextInput
              style={styles.modalInput}
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={colors.gray[600]}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>Bio</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={bio}
              onChangeText={setBio}
              placeholderTextColor={colors.gray[600]}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={3}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main Settings Screen
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Edit profile modal
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Notification toggles
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [commentAlerts, setCommentAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Appearance state
  const [themeValue, setThemeValue] = useState<'Dark' | 'Light' | 'System'>('Dark');
  const [fontSizeValue, setFontSizeValue] = useState<'Small' | 'Medium' | 'Large'>('Medium');

  // Content state
  const [aiStyle, setAiStyle] = useState<'Professional' | 'Casual' | 'Academic' | 'Creative'>('Professional');
  const [autoSave, setAutoSave] = useState(true);
  const [seoSuggestions, setSeoSuggestions] = useState(true);

  // Email preferences toggle (account section)
  const [emailPrefs, setEmailPrefs] = useState(true);

  // ---------- Handlers ----------

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Enter your current password and choose a new one.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => Alert.alert('Success', 'Password updated successfully.'),
        },
      ],
    );
  };

  const handleConnectedAccounts = () => {
    Alert.alert('Connected Accounts', 'Google: Connected\nGitHub: Not connected', [
      { text: 'OK' },
    ]);
  };

  const handleSubscription = () => {
    Alert.alert(
      'Subscription',
      'You are on the Free Plan.\n\nUpgrade to Pro for $9/mo to unlock unlimited posts, analytics, and custom domains.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Upgrade', onPress: () => Alert.alert('Upgrade', 'Redirecting to upgrade page...') },
      ],
    );
  };

  const cycleTheme = () => {
    const options: Array<'Dark' | 'Light' | 'System'> = ['Dark', 'Light', 'System'];
    Alert.alert('Theme', 'Choose a theme:', [
      ...options.map((opt) => ({
        text: opt + (themeValue === opt ? ' (current)' : ''),
        onPress: () => setThemeValue(opt),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const cycleFontSize = () => {
    const options: Array<'Small' | 'Medium' | 'Large'> = ['Small', 'Medium', 'Large'];
    Alert.alert('Font Size', 'Choose a font size:', [
      ...options.map((opt) => ({
        text: opt + (fontSizeValue === opt ? ' (current)' : ''),
        onPress: () => setFontSizeValue(opt),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const handleLanguage = () => {
    Alert.alert('Language', 'Choose a language:', [
      { text: 'English (current)' },
      { text: 'Spanish', onPress: () => Alert.alert('Language', 'Language changed to Spanish.') },
      { text: 'French', onPress: () => Alert.alert('Language', 'Language changed to French.') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDefaultEditor = () => {
    Alert.alert('Default Editor', 'Choose your editor:', [
      { text: 'Block Editor (current)' },
      { text: 'Markdown Editor', onPress: () => Alert.alert('Editor', 'Switched to Markdown Editor.') },
      { text: 'Rich Text Editor', onPress: () => Alert.alert('Editor', 'Switched to Rich Text Editor.') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleAiStyle = () => {
    const options: Array<'Professional' | 'Casual' | 'Academic' | 'Creative'> = [
      'Professional',
      'Casual',
      'Academic',
      'Creative',
    ];
    Alert.alert('AI Writing Style', 'Choose your preferred style:', [
      ...options.map((opt) => ({
        text: opt + (aiStyle === opt ? ' (current)' : ''),
        onPress: () => setAiStyle(opt),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'Need help? Contact us at:\n\nsupport@rankflo.io\n\nWe typically respond within 24 hours.',
      [{ text: 'OK' }],
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'This will open the Privacy Policy in your browser.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => {} },
    ]);
  };

  const handleTerms = () => {
    Alert.alert('Terms of Service', 'This will open the Terms of Service in your browser.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => {} },
    ]);
  };

  const handleRateApp = () => {
    Alert.alert('Rate RankFlo', 'Enjoying RankFlo? Rate us on the App Store!', [
      { text: 'Not Now', style: 'cancel' },
      { text: 'Rate', onPress: () => {} },
    ]);
  };

  return (
    <>
      <EditProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <Text style={styles.profileName}>Jane Doe</Text>
            <Text style={styles.profileEmail}>jane@rankflo.io</Text>
            <Pressable
              style={({ pressed }) => [
                styles.editProfileBtn,
                pressed && styles.editProfileBtnPressed,
              ]}
              onPress={() => setProfileModalVisible(true)}
            >
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </Pressable>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <SectionHeader title="ACCOUNT" />
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="person-outline"
              label="Profile"
              onPress={() => Alert.alert('Profile', 'Edit profile coming soon.')}
            />
            <SettingsRow
              icon="lock-closed-outline"
              label="Password"
              onPress={handleChangePassword}
            />
            <SwitchRow
              icon="mail-outline"
              label="Email Preferences"
              value={emailPrefs}
              onValueChange={setEmailPrefs}
            />
            <SettingsRow
              icon="link-outline"
              label="Connected Accounts"
              onPress={handleConnectedAccounts}
            />
            <SettingsRow
              icon="card-outline"
              label="Subscription"
              value="Free Plan"
              onPress={handleSubscription}
              isLast
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <SectionHeader title="NOTIFICATIONS" />
          <View style={styles.sectionCard}>
            <SwitchRow
              icon="notifications-outline"
              label="Push Notifications"
              value={pushNotifs}
              onValueChange={setPushNotifs}
            />
            <SwitchRow
              icon="mail-unread-outline"
              label="Email Notifications"
              value={emailNotifs}
              onValueChange={setEmailNotifs}
            />
            <SwitchRow
              icon="chatbubble-outline"
              label="Comment Alerts"
              value={commentAlerts}
              onValueChange={setCommentAlerts}
            />
            <SwitchRow
              icon="newspaper-outline"
              label="Weekly Digest"
              value={weeklyDigest}
              onValueChange={setWeeklyDigest}
              isLast
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <SectionHeader title="APPEARANCE" />
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="moon-outline"
              label="Theme"
              value={themeValue}
              onPress={cycleTheme}
            />
            <SettingsRow
              icon="text-outline"
              label="Font Size"
              value={fontSizeValue}
              onPress={cycleFontSize}
            />
            <SettingsRow
              icon="globe-outline"
              label="Language"
              value="English"
              onPress={handleLanguage}
              isLast
            />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.section}>
          <SectionHeader title="CONTENT" />
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="create-outline"
              label="Default Editor"
              value="Block Editor"
              onPress={handleDefaultEditor}
            />
            <SettingsRow
              icon="sparkles-outline"
              label="AI Writing Style"
              value={aiStyle}
              onPress={handleAiStyle}
            />
            <SwitchRow
              icon="save-outline"
              label="Auto-save"
              value={autoSave}
              onValueChange={setAutoSave}
            />
            <SwitchRow
              icon="search-outline"
              label="SEO Suggestions"
              value={seoSuggestions}
              onValueChange={setSeoSuggestions}
              isLast
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <SectionHeader title="ABOUT" />
          <View style={styles.sectionCard}>
            <SettingsRow
              icon="help-circle-outline"
              label="Help & Support"
              onPress={handleHelpSupport}
            />
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={handlePrivacyPolicy}
            />
            <SettingsRow
              icon="document-text-outline"
              label="Terms of Service"
              onPress={handleTerms}
            />
            <SettingsRow
              icon="star-outline"
              label="Rate App"
              onPress={handleRateApp}
            />
            <SettingsRow
              icon="information-circle-outline"
              label="Version"
              isLast
              right={<Text style={styles.rowValue}>v0.0.1 (build 1)</Text>}
            />
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [styles.logoutRow, pressed && styles.rowPressed]}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={colors.red}
                  style={styles.rowIcon}
                />
                <Text style={styles.logoutLabel}>Sign Out</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Footer spacing */}
        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </>
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
  scrollContent: {
    paddingBottom: spacing['5xl'],
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
  },

  // Profile card
  profileCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray[800],
    marginBottom: spacing['2xl'],
    padding: spacing.xl,
  },
  profileTop: {
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gray[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.white,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
    marginBottom: spacing.lg,
  },
  editProfileBtn: {
    borderWidth: 1,
    borderColor: colors.gray[600],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  editProfileBtnPressed: {
    backgroundColor: colors.gray[800],
  },
  editProfileBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },

  // Sections
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  sectionCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray[800],
    overflow: 'hidden',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[800],
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  rowLabel: {
    fontSize: fontSize.base,
    color: colors.white,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowValue: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },

  // Logout
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: spacing.lg,
  },
  logoutLabel: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.red,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.gray[900],
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
  },
  modalField: {
    marginBottom: spacing.lg,
  },
  modalLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[400],
    marginBottom: spacing.sm,
  },
  modalInput: {
    backgroundColor: colors.gray[800],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: fontSize.base,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonPressed: {
    opacity: 0.85,
  },
  saveButtonText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.black,
  },
});
