import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { useAgentStore } from '../../stores/agentStore';
import { useQuestStore } from '../../stores/questStore';
import { useChronicleStore } from '../../stores/chronicleStore';
import { CountBadge } from '../../components/ui/StatusBadge';

export default function TabLayout() {
  // Get badge counts
  const agentsNeedingAttention = useAgentStore((state) => state.getAgentsNeedingAttention().length);
  const pendingQuests = useQuestStore((state) => state.getPendingReviewQuests().length);
  const unreadChronicle = useChronicleStore((state) => state.unreadCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.arcane.purple,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="spire"
        options={{
          title: 'Spire',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'business' : 'business-outline'}
              color={color}
              size={size}
              badge={agentsNeedingAttention}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Chronicle',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'document-text' : 'document-text-outline'}
              color={color}
              size={size}
              badge={unreadChronicle}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: 'Quests',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'map' : 'map-outline'}
              color={color}
              size={size}
              badge={pendingQuests}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="grimoire"
        options={{
          title: 'Grimoire',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'book' : 'book-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// Tab icon with optional badge
interface TabIconProps {
  name: string;
  color: string;
  size: number;
  badge?: number;
}

function TabIcon({ name, color, size, badge }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name={name as any} size={size} color={color} />
      {badge !== undefined && badge > 0 && (
        <CountBadge count={badge} style={styles.badge} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.shadow.darker,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 84 : 60,
    paddingTop: Spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.xs,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  tabItem: {
    paddingVertical: Spacing.xs,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
});
