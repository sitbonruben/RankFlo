import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/lib/theme';

// This screen is never shown directly - the tab press is intercepted
// and redirects to the /create modal. This file exists only because
// expo-router requires a matching file for each Tabs.Screen.
export default function CreateTabPlaceholder() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
});
