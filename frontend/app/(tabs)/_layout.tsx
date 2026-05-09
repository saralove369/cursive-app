import React from 'react';
import { Tabs } from 'expo-router';
import { PenTool, Library, Archive, Compass, User } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';
import { colors, fonts } from '../../src/theme';
import { haptics } from '../../src/lib/haptics';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent.gold,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.bg.primary,
          borderTopColor: colors.border.default,
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 26 : 12,
          height: Platform.OS === 'ios' ? 86 : 70,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.accent,
          fontSize: 10,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="studio"
        options={{
          title: 'Studio',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <PenTool size={20} color={color} strokeWidth={1.5} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Library size={20} color={color} strokeWidth={1.5} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Archive size={20} color={color} strokeWidth={1.5} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Compass size={20} color={color} strokeWidth={1.5} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <User size={20} color={color} strokeWidth={1.5} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ children, focused }: { children: React.ReactNode; focused: boolean }) {
  return (
    <View style={styles.iconBox}>
      {children}
      {focused ? <View style={styles.dot} /> : <View style={styles.dotInvisible} />}
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent.gold,
    marginTop: 6,
  },
  dotInvisible: {
    width: 4,
    height: 4,
    marginTop: 6,
  },
});
