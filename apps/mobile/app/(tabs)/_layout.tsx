import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize } from '@/lib/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  label: string;
  iconDefault: IoniconsName;
  iconFocused: IoniconsName;
  focused: boolean;
  isCreate?: boolean;
}

function TabIcon({
  label,
  iconDefault,
  iconFocused,
  focused,
  isCreate,
}: TabIconProps) {
  if (isCreate) {
    return (
      <View style={styles.createButtonOuter}>
        <View style={styles.createButton}>
          <Ionicons name="add" size={28} color={colors.black} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabIconContainer}>
      <Ionicons
        name={focused ? iconFocused : iconDefault}
        size={22}
        color={focused ? colors.white : colors.gray[500]}
      />
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? colors.white : colors.gray[500] },
        ]}
      >
        {label}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

function TabBarBackground() {
  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={StyleSheet.absoluteFill}
    >
      <View style={[StyleSheet.absoluteFill, styles.tabBarOverlay]} />
    </BlurView>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Feed"
              iconDefault="home-outline"
              iconFocused="home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Projects"
              iconDefault="folder-outline"
              iconFocused="folder"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Create"
              iconDefault="add-circle-outline"
              iconFocused="add-circle"
              focused={focused}
              isCreate
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/create');
          },
        }}
      />
      <Tabs.Screen
        name="posts"
        options={{
          title: 'Posts',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Posts"
              iconDefault="document-text-outline"
              iconFocused="document-text"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Settings"
              iconDefault="cog-outline"
              iconFocused="cog"
              focused={focused}
            />
          ),
        }}
      />
      {/* Hide the analytics tab from the tab bar but keep the route accessible */}
      <Tabs.Screen
        name="analytics"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  tabBarOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: fontSize.xs - 1,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
  createButtonOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
