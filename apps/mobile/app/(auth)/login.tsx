import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { login } from '@/lib/auth';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login failed';
      Alert.alert('Sign In Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo area */}
        <View style={styles.logoSection}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>RankFlo</Text>
            <View style={styles.accentDot} />
          </View>
          <Text style={styles.tagline}>Create beautiful blogs, anywhere</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email input */}
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={colors.gray[500]}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={colors.gray[600]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          {/* Password input */}
          <View>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.gray[500]}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.gray[600]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                onSubmitEditing={handleLogin}
                returnKeyType="go"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.gray[500]}
                />
              </Pressable>
            </View>
            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          {/* Sign In button */}
          <Pressable
            style={({ pressed }) => [
              styles.signInButton,
              pressed && styles.signInButtonPressed,
              loading && styles.signInButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.black} size="small" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* OAuth buttons */}
        <View style={styles.oauthRow}>
          <Pressable
            style={({ pressed }) => [
              styles.oauthButton,
              pressed && styles.oauthButtonPressed,
            ]}
          >
            <Ionicons name="logo-google" size={20} color={colors.white} />
            <Text style={styles.oauthLabel}>Google</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.oauthButton,
              pressed && styles.oauthButtonPressed,
            ]}
          >
            <Ionicons name="logo-github" size={20} color={colors.white} />
            <Text style={styles.oauthLabel}>GitHub</Text>
          </Pressable>
        </View>

        {/* Create account link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{"Don't have an account? "}</Text>
          <Pressable>
            <Text style={styles.createAccountText}>Create one</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.black,
  },
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['5xl'],
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    paddingTop: spacing['5xl'] + 20,
    paddingBottom: spacing['4xl'],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1.5,
  },
  accentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginLeft: 2,
    marginTop: 6,
  },
  tagline: {
    fontSize: fontSize.base,
    color: colors.gray[500],
    marginTop: spacing.md,
    letterSpacing: 0.2,
  },

  // Form
  form: {
    gap: spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.xl,
    height: 52,
    paddingHorizontal: spacing.lg,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.white,
    height: 52,
  },
  eyeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  forgotText: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.xl,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  signInButtonPressed: {
    opacity: 0.85,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.black,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing['3xl'],
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray[800],
  },
  dividerText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },

  // OAuth
  oauthRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  oauthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[900],
  },
  oauthButtonPressed: {
    opacity: 0.7,
  },
  oauthLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[300],
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['4xl'],
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  createAccountText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.accent,
  },
});
